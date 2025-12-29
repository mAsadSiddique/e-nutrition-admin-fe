import type { TBlogMedia } from "@src/utils/types";

/**
 * Extracts images from HTML content and processes them with IDs
 * @param htmlContent - The HTML content containing image tags
 * @returns Object containing processed HTML content and image files mapped by ID
 */
export function extractAndProcessImages(htmlContent: string): {
  processedContent: string;
  images: Map<number, File>;
} {
  const images = new Map<number, File>();
  let imageCounter = 1;
  let processedContent = htmlContent;

  // Use a temporary div to parse and manipulate HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // Find all img tags
  const imgTags = tempDiv.querySelectorAll("img");

  imgTags.forEach((img) => {
    const src = img.getAttribute("src");

    if (src && src.startsWith("data:image/")) {
      try {
        // Extract base64 data and mime type
        const matches = src.match(/^data:image\/([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];

          // Convert base64 to binary
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Create a File object
          const blob = new Blob([bytes], { type: `image/${mimeType}` });
          const fileName = `image-${imageCounter}.${mimeType}`;
          const file = new File([blob], fileName, { type: `image/${mimeType}` });

          // Store the image with its ID
          images.set(imageCounter, file);

          // Replace the src with a placeholder that includes the ID
          img.setAttribute("src", `{{IMAGE_ID:${imageCounter}}}`);
          img.setAttribute("data-image-id", String(imageCounter));

          imageCounter++;
        }
      } catch (error) {
        console.error("Error processing image:", error);
        // If there's an error, leave the image as is
      }
    }
  });

  // Get the processed HTML content
  processedContent = tempDiv.innerHTML;

  return {
    processedContent,
    images,
  };
}

/**
 * Replaces image placeholders in HTML content with actual URLs from media object
 * @param htmlContent - The HTML content with image placeholders like {{IMAGE_ID:1}}
 * @param media - The media object containing images with keys like "1_1767029410285image-1.jpeg"
 * @returns Processed HTML content with image URLs replaced
 */
export function replaceImagePlaceholdersWithUrls(
  htmlContent: string,
  media?: TBlogMedia
): string {
  if (!media?.images || Object.keys(media.images).length === 0) {
    return htmlContent;
  }

  // Create a map of image index to URL
  const imageUrlMap = new Map<number, string>();

  // Process each image key to extract the index and map it to the URL
  Object.entries(media.images).forEach(([key, url]) => {
    // Split by "_" and take the first part as the image index
    const parts = key.split("_");
    if (parts.length > 0) {
      const imageIndex = parseInt(parts[0], 10);
      if (!Number.isNaN(imageIndex) && imageIndex > 0) {
        imageUrlMap.set(imageIndex, url);
      }
    }
  });

  // Replace placeholders in the HTML content
  let processedContent = htmlContent;

  // Replace placeholders like {{IMAGE_ID:1}} with actual URLs
  imageUrlMap.forEach((url, imageId) => {
    const placeholder = `{{IMAGE_ID:${imageId}}}`;
    // Replace in src attributes
    processedContent = processedContent.replace(
      new RegExp(`src=["']${placeholder.replace(/[{}]/g, "\\$&")}["']`, "g"),
      `src="${url}"`
    );
    // Also replace standalone placeholders
    processedContent = processedContent.replace(
      new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
      url
    );
  });

  // Also handle img tags that might have the placeholder in src attribute
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = processedContent;
  const imgTags = tempDiv.querySelectorAll("img");

  imgTags.forEach((img) => {
    const src = img.getAttribute("src");
    if (src && src.includes("{{IMAGE_ID:")) {
      const match = src.match(/{{IMAGE_ID:(\d+)}}/);
      if (match) {
        const imageId = parseInt(match[1], 10);
        const url = imageUrlMap.get(imageId);
        if (url) {
          img.setAttribute("src", url);
        }
      }
    }
  });

  return tempDiv.innerHTML;
}
