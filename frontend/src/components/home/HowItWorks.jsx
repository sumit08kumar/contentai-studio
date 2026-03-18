import { useState } from 'react';
import {
  RocketLaunchIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  VideoCameraIcon,
  PencilSquareIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

/* ── Shared workflow steps ─────────────────────────────── */
const commonSteps = [
  {
    number: '01',
    icon: RocketLaunchIcon,
    title: 'Choose Your Workflow',
    description:
      'Pick what you want to create — start a video Q&A session or generate a full blog post. One platform, two powerful paths.',
    color: 'from-primary-500 to-primary-600',
    branches: {
      video: { label: 'YouTube Q&A', icon: VideoCameraIcon },
      blog: { label: 'Blog Generator', icon: PencilSquareIcon },
    },
  },
  {
    number: '02',
    icon: CpuChipIcon,
    title: 'Provide Your Input',
    description: null, // per-branch descriptions
    color: 'from-secondary-500 to-secondary-600',
    branchDetails: {
      video: {
        description:
          'Paste any YouTube URL — we extract the full transcript, auto-detect the language, and chunk it into vector embeddings stored in Pinecone.',
        pills: ['Transcript extraction', 'Multilingual', 'Vector embeddings'],
      },
      blog: {
        description:
          'Type a topic or keyword — our agents search the web with Tavily, gather research, and build a structured content outline.',
        pills: ['Web research', 'Tavily search', 'Content planning'],
      },
    },
  },
  {
    number: '03',
    icon: SparklesIcon,
    title: 'AI Does the Heavy Lifting',
    description: null,
    color: 'from-emerald-500 to-emerald-600',
    branchDetails: {
      video: {
        description:
          'Ask anything about the video. Our RAG pipeline retrieves the most relevant chunks and GPT-4 answers with full context and citations.',
        pills: ['RAG retrieval', 'GPT-4 answers', 'Source citations'],
      },
      blog: {
        description:
          'A LangGraph pipeline drafts, critiques, and refines your blog — then generates AI illustrations with HuggingFace models.',
        pills: ['LangGraph pipeline', 'Auto-critique', 'AI illustrations'],
      },
    },
  },
  {
    number: '04',
    icon: ArrowDownTrayIcon,
    title: 'Export & Publish',
    description: null,
    color: 'from-purple-500 to-purple-600',
    branchDetails: {
      video: {
        description:
          'Download the entire conversation as Markdown, copy cited answers, or continue chatting to explore deeper.',
        pills: ['Markdown export', 'Copy citations', 'Unlimited follow-ups'],
      },
      blog: {
        description:
          'Get a polished, SEO-ready blog with images. Download as Markdown or preview it right inside the app.',
        pills: ['SEO-optimised', 'Image gallery', 'Markdown download'],
      },
    },
  },
];

/* ── Pill badge ─────────────────────────────────────────── */
const Pill = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200/60">
    {children}
  </span>
);

/* ── Branch toggle ──────────────────────────────────────── */
const BranchToggle = ({ active, onChange }) => (
  <div className="inline-flex items-center rounded-full bg-gray-100 p-1 gap-1">
    {[
      { key: 'video', label: 'YouTube Q&A', Icon: VideoCameraIcon },
      { key: 'blog', label: 'Blog Generator', Icon: PencilSquareIcon },
    ].map(({ key, label, Icon }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          active === key
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    ))}
  </div>
);

/* ── Visual branch icons (step 1) ──────────────────────── */
const BranchCards = ({ active, onChange }) => (
  <div className="flex justify-center gap-4 mt-4">
    {[
      {
        key: 'video',
        Icon: VideoCameraIcon,
        label: 'YouTube Q&A',
        gradient: 'from-red-500 to-orange-500',
      },
      {
        key: 'blog',
        Icon: PencilSquareIcon,
        label: 'Blog Generator',
        gradient: 'from-violet-500 to-fuchsia-500',
      },
    ].map(({ key, Icon, label, gradient }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={`relative flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
          active === key
            ? 'border-primary-500 bg-primary-50/50 shadow-md scale-[1.03]'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        {active === key && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </span>
        )}
      </button>
    ))}
  </div>
);

/* ── Main component ─────────────────────────────────────── */
const HowItWorks = () => {
  const [branch, setBranch] = useState('video');

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-50 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600 mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            One platform,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              two powerful workflows
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Whether you're chatting with a YouTube video or generating a
            publication-ready blog — the process is seamless.
          </p>
        </div>

        {/* Branch toggle */}
        <div className="flex justify-center mb-14">
          <BranchToggle active={branch} onChange={setBranch} />
        </div>

        {/* Steps — vertical timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary-200 via-secondary-200 to-purple-200 hidden sm:block" />

          <div className="space-y-12">
            {commonSteps.map((step, index) => {
              const details = step.branchDetails?.[branch];
              const desc =
                step.description || (details ? details.description : '');
              const pills = details?.pills || [];

              return (
                <div
                  key={step.number}
                  className="relative flex gap-6 sm:gap-8 group"
                >
                  {/* Number + Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:-translate-y-0.5 transition-all duration-300`}
                    >
                      <step.icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-gray-100 text-[10px] font-bold text-gray-900 flex items-center justify-center shadow-sm">
                      {step.number}
                    </span>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                      {step.title}
                    </h3>
                    <p
                      className="text-sm text-gray-500 leading-relaxed transition-all duration-300"
                      key={`${step.number}-${branch}`}
                    >
                      {desc}
                    </p>

                    {/* Branch cards for step 1 */}
                    {index === 0 && (
                      <BranchCards active={branch} onChange={setBranch} />
                    )}

                    {/* Detail pills */}
                    {pills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {pills.map((pill) => (
                          <Pill key={pill}>{pill}</Pill>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
