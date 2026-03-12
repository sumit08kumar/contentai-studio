"""
Image generation handler using Hugging Face Inference API.

Uses the `huggingface_hub` InferenceClient which handles automatic
provider routing (router.huggingface.co).
"""

import asyncio
import logging
from pathlib import Path
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Default model for image generation
IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"


async def generate_image(
    prompt: str,
    output_path: str,
    size: str = "1024x1024",
    negative_prompt: str = "blurry, low quality, text, watermark, signature, deformed",
) -> Optional[str]:
    """
    Generate an image from a text prompt using Hugging Face InferenceClient.

    Args:
        prompt: The text prompt for image generation
        output_path: Full file path to save the generated image
        size: Image size (currently SDXL defaults to 1024x1024)
        negative_prompt: Things to avoid in the image

    Returns:
        The output_path on success, None on failure
    """
    if not settings.HF_API_TOKEN:
        logger.warning("HF_API_TOKEN not set, skipping image generation")
        return None

    try:
        from huggingface_hub import InferenceClient

        client = InferenceClient(api_key=settings.HF_API_TOKEN)

        # Run sync client in thread pool to avoid blocking the event loop
        def _generate():
            return client.text_to_image(
                prompt=prompt,
                model=IMAGE_MODEL,
                negative_prompt=negative_prompt,
                num_inference_steps=30,
                guidance_scale=7.5,
            )

        image = await asyncio.to_thread(_generate)

        # Ensure parent directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        # Save the PIL image
        image.save(output_path)
        logger.info(f"Image generated: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Image generation error: {e}")
        return None


async def generate_blog_images(
    image_specs: list,
    user_id: str,
    blog_id: str,
    base_dir: str = "storage/images",
) -> list:
    """
    Generate all images for a blog post.

    Args:
        image_specs: List of image spec dicts (placeholder, prompt, filename, etc.)
        user_id: Owner user ID
        blog_id: Blog document ID
        base_dir: Base directory for image storage

    Returns:
        Updated image_specs with file_path set for successfully generated images
    """
    output_dir = Path(base_dir) / str(user_id) / str(blog_id)
    output_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for spec in image_specs:
        filename = spec.get("filename", "image.png")
        output_path = str(output_dir / filename)

        generated_path = await generate_image(
            prompt=spec.get("prompt", ""),
            output_path=output_path,
            size=spec.get("size", "1024x1024"),
        )

        spec_copy = dict(spec)
        spec_copy["file_path"] = generated_path or ""
        results.append(spec_copy)

    success_count = sum(1 for r in results if r["file_path"])
    logger.info(
        f"Generated {success_count}/{len(image_specs)} images for blog {blog_id}"
    )
    return results
