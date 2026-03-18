"""
Blog Writing Agent (BWA) Engine
LangGraph-based multi-stage pipeline for AI blog generation.

Pipeline stages:
  1. Planner  – Decides research mode, creates structured blog plan
  2. Researcher – Fetches web evidence via Tavily (if needed)
  3. Worker   – Writes each section in parallel
  4. Merger   – Stitches sections, inserts image placeholders
  5. Imager   – Generates image specs for each placeholder
  6. Finalizer – Produces final markdown with inline images
"""

from __future__ import annotations

import logging
import operator
import re
from datetime import date, timedelta
from typing import (
    Annotated,
    Any,
    Dict,
    List,
    Literal,
    Optional,
    TypedDict,
)

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger(__name__)

# ─── Pydantic schemas for structured LLM output ────────────────────────────

class Task(BaseModel):
    """A single blog section/task."""
    id: int = Field(description="Sequential task ID starting from 1")
    title: str = Field(description="Section heading")
    goal: str = Field(description="What this section should accomplish")
    target_words: int = Field(description="Approximate word count for this section", ge=50, le=2000)
    requires_research: bool = Field(default=False, description="Whether this section needs web research")
    requires_citations: bool = Field(default=False, description="Whether to include inline citations")
    requires_code: bool = Field(default=False, description="Whether this section includes code blocks")
    tags: List[str] = Field(default_factory=list, description="Tags like 'intro', 'conclusion', 'technical'")


class Plan(BaseModel):
    """Full blog plan produced by the planner node."""
    blog_title: str = Field(description="The blog post title")
    blog_kind: str = Field(description="Type: 'explainer', 'tutorial', 'news_roundup', 'opinion', 'how_to'")
    audience: str = Field(description="Target audience description")
    tone: str = Field(description="Writing tone, e.g. 'educational, clear'")
    tasks: List[Task] = Field(description="Ordered list of sections to write")


class ModeDecision(BaseModel):
    """Planner's decision on research mode."""
    mode: Literal["closed_book", "hybrid", "open_book"] = Field(
        description="closed_book = no research needed, hybrid = some sections need research, open_book = heavy research required"
    )
    needs_research: bool = Field(description="Whether any web research is required")
    queries: List[str] = Field(
        default_factory=list,
        description="Search queries to execute if research is needed (max 5)",
    )


class EvidenceItem(BaseModel):
    """A single piece of research evidence."""
    title: str = ""
    url: str = ""
    snippet: str = ""
    published_at: Optional[str] = None
    source: str = ""


class ImageSpec(BaseModel):
    """Specification for a single blog image."""
    placeholder: str = Field(description="Placeholder tag like [[IMAGE_1]]")
    alt: str = Field(description="Alt text for the image")
    caption: str = Field(description="Caption below the image")
    prompt: str = Field(description="Stable Diffusion prompt for image generation")
    size: str = Field(default="1024x1024", description="Image size")


class SectionOutput(BaseModel):
    """Output of a single worker writing one section."""
    task_id: int
    title: str
    content: str  # Markdown content for this section


# ─── LangGraph State ────────────────────────────────────────────────────────

class BlogState(TypedDict):
    topic: str
    as_of: str
    recency_days: int
    mode: str
    needs_research: bool
    queries: List[str]
    evidence: Annotated[List[dict], operator.add]
    plan: Optional[dict]
    sections: Annotated[List[dict], operator.add]
    merged_md: str
    md_with_placeholders: str
    image_specs: List[dict]
    final: str


# ─── Worker sub-state (for parallel section writing) ────────────────────────

class WorkerState(TypedDict):
    task: dict
    plan: dict
    evidence: List[dict]
    topic: str
    mode: str
    sections: Annotated[List[dict], operator.add]


# ─── The Engine ──────────────────────────────────────────────────────────────

class BlogWriterEngine:
    """
    Production wrapper for the BWA LangGraph pipeline.
    """

    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=settings.OPENAI_API_KEY,
        )
        self.planner_llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            api_key=settings.OPENAI_API_KEY,
        )
        self.app = self._build_graph()

    # ── Graph construction ───────────────────────────────────────────────

    def _build_graph(self) -> Any:
        graph = StateGraph(BlogState)

        graph.add_node("mode_decider", self._mode_decider)
        graph.add_node("planner", self._planner)
        graph.add_node("researcher", self._researcher)
        graph.add_node("worker", self._worker_entry)
        graph.add_node("section_writer", self._section_writer)
        graph.add_node("merger", self._merger)
        graph.add_node("image_planner", self._image_planner)
        graph.add_node("finalizer", self._finalizer)

        graph.add_edge(START, "mode_decider")
        graph.add_edge("mode_decider", "planner")
        graph.add_conditional_edges(
            "planner",
            self._route_after_plan,
            {"research": "researcher", "write": "worker"},
        )
        graph.add_edge("researcher", "worker")
        graph.add_conditional_edges("worker", self._fan_out_sections)
        graph.add_edge("section_writer", "merger")
        graph.add_edge("merger", "image_planner")
        graph.add_edge("image_planner", "finalizer")
        graph.add_edge("finalizer", END)

        return graph.compile()

    # ── Node: Mode Decider ───────────────────────────────────────────────

    def _mode_decider(self, state: BlogState) -> dict:
        topic = state["topic"]
        as_of = state.get("as_of", date.today().isoformat())

        prompt = f"""You are a blog planning AI. Analyze the following topic and decide the research mode.

Topic: {topic}
Date context: {as_of}

Decide:
- "closed_book": The topic is well-established and you can write about it from general knowledge (e.g., "What is Python?")
- "hybrid": Some sections need recent data or specific facts from the web (e.g., "Best React frameworks in 2024")
- "open_book": The topic is primarily about recent events/news and needs heavy research (e.g., "Latest AI developments this week")

If research is needed, provide up to 5 specific search queries."""

        structured_llm = self.planner_llm.with_structured_output(ModeDecision)
        result = structured_llm.invoke([HumanMessage(content=prompt)])

        logger.info(f"BWA Mode Decision: {result.mode}, needs_research={result.needs_research}")

        return {
            "mode": result.mode,
            "needs_research": result.needs_research,
            "queries": result.queries,
        }

    # ── Node: Planner ────────────────────────────────────────────────────

    def _planner(self, state: BlogState) -> dict:
        topic = state["topic"]
        mode = state["mode"]
        as_of = state.get("as_of", date.today().isoformat())

        system_msg = """You are an expert blog planner. Create a detailed, structured plan for a technical blog post.
The plan should include 4-7 sections with clear goals, word targets, and tags.
Make the blog engaging, well-structured, and informative."""

        human_msg = f"""Create a comprehensive blog plan for:

Topic: {topic}
Mode: {mode}
Date: {as_of}

Requirements:
- Title should be catchy and SEO-friendly
- Include intro and conclusion sections
- Each section should have a clear goal
- Mark sections that need research or citations
- Total word count should be 1500-3000 words"""

        structured_llm = self.planner_llm.with_structured_output(Plan)
        plan = structured_llm.invoke([
            SystemMessage(content=system_msg),
            HumanMessage(content=human_msg),
        ])

        logger.info(f"BWA Plan created: '{plan.blog_title}' with {len(plan.tasks)} sections")

        return {"plan": plan.model_dump()}

    # ── Routing ──────────────────────────────────────────────────────────

    def _route_after_plan(self, state: BlogState) -> str:
        if state["needs_research"] and state["queries"]:
            return "research"
        return "write"

    def _fan_out_sections(self, state: BlogState):
        """Fan out to parallel section writers."""
        plan = state["plan"]
        tasks = plan.get("tasks", [])
        return [
            Send(
                "section_writer",
                {
                    "task": task,
                    "plan": plan,
                    "evidence": state.get("evidence", []),
                    "topic": state["topic"],
                    "mode": state["mode"],
                    "sections": [],
                },
            )
            for task in tasks
        ]

    # ── Node: Researcher ─────────────────────────────────────────────────

    def _researcher(self, state: BlogState) -> dict:
        queries = state.get("queries", [])
        recency_days = state.get("recency_days", 7)
        all_evidence: List[dict] = []

        try:
            from tavily import TavilyClient  # type: ignore

            tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

            for query in queries[:5]:
                try:
                    response = tavily.search(
                        query=query,
                        max_results=5,
                        include_answer=False,
                        search_depth="advanced",
                    )
                    for result in response.get("results", []):
                        ev = {
                            "title": result.get("title", ""),
                            "url": result.get("url", ""),
                            "snippet": result.get("content", "")[:500],
                            "published_at": result.get("published_date"),
                            "source": result.get("url", "").split("/")[2] if result.get("url") else "",
                        }
                        all_evidence.append(ev)

                    logger.info(f"BWA Research: '{query}' → {len(response.get('results', []))} results")
                except Exception as e:
                    logger.warning(f"BWA Tavily search failed for '{query}': {e}")

        except ImportError:
            logger.warning("tavily-python not installed, skipping research")

        # Deduplicate by URL
        seen_urls = set()
        unique_evidence = []
        for ev in all_evidence:
            if ev["url"] not in seen_urls:
                seen_urls.add(ev["url"])
                unique_evidence.append(ev)

        logger.info(f"BWA Research complete: {len(unique_evidence)} unique sources")
        return {"evidence": unique_evidence}

    # ── Node: Worker Entry (fan-out trigger) ─────────────────────────────

    def _worker_entry(self, state: BlogState) -> dict:
        # This is a pass-through; actual fan-out is via conditional edges
        return {}

    # ── Node: Section Writer ─────────────────────────────────────────────

    def _section_writer(self, state: WorkerState) -> dict:
        task = state["task"]
        plan = state["plan"]
        evidence = state.get("evidence", [])
        topic = state["topic"]

        # Build evidence context if needed
        evidence_context = ""
        if task.get("requires_research") and evidence:
            relevant = evidence[:5]
            evidence_context = "\n\nResearch Evidence:\n"
            for i, ev in enumerate(relevant, 1):
                evidence_context += f"[{i}] {ev['title']}\n    URL: {ev['url']}\n    Snippet: {ev['snippet']}\n\n"

        system_msg = f"""You are an expert technical writer. Write a single section of a blog post.

Blog Title: {plan.get('blog_title', topic)}
Blog Kind: {plan.get('blog_kind', 'explainer')}
Audience: {plan.get('audience', 'developers')}
Tone: {plan.get('tone', 'educational, clear')}

Guidelines:
- Write in Markdown format
- Start with the section heading (## level)
- Target approximately {task.get('target_words', 300)} words
- Be informative, engaging, and accurate
{"- Include inline citations [1], [2] etc. when referencing evidence" if task.get("requires_citations") else ""}
{"- Include relevant code examples with proper syntax highlighting" if task.get("requires_code") else ""}
- Do NOT include the blog title (just the section content)"""

        human_msg = f"""Write this section:

Section: {task.get('title', 'Section')}
Goal: {task.get('goal', 'Inform the reader')}
Tags: {', '.join(task.get('tags', []))}
{evidence_context}

Write the complete section content in Markdown:"""

        response = self.llm.invoke([
            SystemMessage(content=system_msg),
            HumanMessage(content=human_msg),
        ])

        section = {
            "task_id": task.get("id", 0),
            "title": task.get("title", "Section"),
            "content": response.content,
        }

        return {"sections": [section]}

    # ── Node: Merger ─────────────────────────────────────────────────────

    def _merger(self, state: BlogState) -> dict:
        plan = state.get("plan", {})
        sections = sorted(state.get("sections", []), key=lambda s: s.get("task_id", 0))

        title = plan.get("blog_title", state["topic"])
        merged = f"# {title}\n\n"

        for section in sections:
            merged += section.get("content", "") + "\n\n"

        # Add references section if we have evidence
        evidence = state.get("evidence", [])
        if evidence:
            merged += "---\n\n## References\n\n"
            for i, ev in enumerate(evidence, 1):
                merged += f"{i}. [{ev.get('title', 'Source')}]({ev.get('url', '#')})\n"
            merged += "\n"

        # Insert image placeholders between major sections
        lines = merged.split("\n")
        new_lines = []
        img_count = 0
        for i, line in enumerate(lines):
            new_lines.append(line)
            # Add image placeholder after ## headings (not the first one / title)
            if line.startswith("## ") and img_count < 4:
                img_count += 1
                new_lines.append(f"\n[[IMAGE_{img_count}]]\n")

        md_with_placeholders = "\n".join(new_lines)

        return {
            "merged_md": merged,
            "md_with_placeholders": md_with_placeholders,
        }

    # ── Node: Image Planner ──────────────────────────────────────────────

    def _image_planner(self, state: BlogState) -> dict:
        md = state.get("md_with_placeholders", "")
        placeholders = re.findall(r"\[\[IMAGE_\d+\]\]", md)

        if not placeholders:
            return {"image_specs": []}

        topic = state["topic"]
        plan = state.get("plan", {})

        prompt = f"""For a blog post titled "{plan.get('blog_title', topic)}", generate image specifications.

The blog has these image placeholders: {', '.join(placeholders)}

For each placeholder, provide:
- alt: descriptive alt text
- caption: a caption for below the image
- prompt: a detailed Stable Diffusion prompt for generating a relevant, professional diagram/illustration

The images should be professional, clean, and relevant to the blog content.
Avoid generating images of real people. Focus on diagrams, illustrations, abstract concepts, or landscapes."""

        try:
            structured_llm = self.llm.with_structured_output(
                type("ImageSpecs", (BaseModel,), {
                    "__annotations__": {"specs": List[ImageSpec]},
                    "specs": Field(description="List of image specifications"),
                })
            )
            result = structured_llm.invoke([HumanMessage(content=prompt)])
            specs = [s.model_dump() for s in result.specs]

            # Ensure placeholders match
            for i, spec in enumerate(specs):
                if i < len(placeholders):
                    spec["placeholder"] = placeholders[i]
                    spec["filename"] = f"image_{i+1}.png"

            logger.info(f"BWA Image Planner: {len(specs)} image specs generated")
            return {"image_specs": specs}

        except Exception as e:
            logger.warning(f"BWA Image planning failed: {e}")
            # Generate basic specs as fallback
            specs = []
            for i, ph in enumerate(placeholders):
                specs.append({
                    "placeholder": ph,
                    "alt": f"Illustration for {topic}",
                    "caption": f"Figure {i+1}",
                    "prompt": f"Professional technical illustration about {topic}, clean minimal style, white background",
                    "size": "1024x1024",
                    "filename": f"image_{i+1}.png",
                })
            return {"image_specs": specs}

    # ── Node: Finalizer ──────────────────────────────────────────────────

    def _finalizer(self, state: BlogState) -> dict:
        md = state.get("md_with_placeholders", state.get("merged_md", ""))
        image_specs = state.get("image_specs", [])

        # Replace placeholders with markdown image syntax
        for spec in image_specs:
            placeholder = spec.get("placeholder", "")
            alt = spec.get("alt", "")
            caption = spec.get("caption", "")
            filename = spec.get("filename", "image.png")

            img_md = f"![{alt}](images/{filename})\n*{caption}*"
            md = md.replace(placeholder, img_md)

        return {"final": md}

    # ── Public API ───────────────────────────────────────────────────────

    async def generate_blog(
        self,
        topic: str,
        as_of: str = None,
        progress_callback: Optional[Any] = None,
    ) -> dict:
        """
        Generate a blog post.

        Args:
            topic: Blog topic string
            as_of: Date context (YYYY-MM-DD)
            progress_callback: Optional async callback for progress updates

        Returns:
            dict with plan, evidence, sections, final markdown, image_specs
        """
        if as_of is None:
            as_of = date.today().isoformat()

        inputs: BlogState = {
            "topic": topic,
            "as_of": as_of,
            "recency_days": 7,
            "mode": "",
            "needs_research": False,
            "queries": [],
            "evidence": [],
            "plan": None,
            "sections": [],
            "merged_md": "",
            "md_with_placeholders": "",
            "image_specs": [],
            "final": "",
        }

        current_state: dict = {}
        stage_names = {
            "mode_decider": "Analyzing topic",
            "planner": "Creating blog plan",
            "researcher": "Researching web sources",
            "worker": "Preparing sections",
            "section_writer": "Writing sections",
            "merger": "Merging content",
            "image_planner": "Planning images",
            "finalizer": "Finalizing blog",
        }

        async for event in self.app.astream(inputs, stream_mode="updates"):
            for node_name, node_output in event.items():
                if isinstance(node_output, dict):
                    current_state.update(node_output)

                if progress_callback:
                    await progress_callback({
                        "stage": node_name,
                        "stage_label": stage_names.get(node_name, node_name),
                        "mode": current_state.get("mode", ""),
                        "evidence_count": len(current_state.get("evidence", [])),
                        "completed_sections": len(current_state.get("sections", [])),
                        "total_sections": len(
                            current_state.get("plan", {}).get("tasks", [])
                        ) if current_state.get("plan") else 0,
                    })

        logger.info(f"BWA Blog generation complete for topic: '{topic}'")
        return current_state
