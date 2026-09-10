/**
 * Media extraction and validation utilities for Krono
 */

// Regular expressions to detect image URLs and media links
const IMAGE_EXTENSION_REGEX = /\.(?:png|jpe?g|gif|webp|svg|avif|bmp)(?:[?#][^\s]*)?$/i;
const IMAGE_IN_TEXT_REGEX = /(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp|svg|avif|bmp)(?:[?#][^\s]*)?)/gi;
const IMAGE_CDN_REGEX = /(https?:\/\/(?:images\.unsplash\.com|i\.imgur\.com|imgur\.com|pbs\.twimg\.com|media\.giphy\.com|upload\.wikimedia\.org|images\.pexels\.com|res\.cloudinary\.com|cdn\.discordapp\.com|lh3\.googleusercontent\.com|i\.pinimg\.com)\/[^\s]+)/gi;
const DATA_IMAGE_REGEX = /(data:image\/[a-zA-Z+]+;base64,[^\s]+)/gi;

/**
 * Check if a URL or string is an image
 */
export function isImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return true;
  if (IMAGE_EXTENSION_REGEX.test(trimmed)) return true;
  if (
    trimmed.includes('images.unsplash.com') ||
    trimmed.includes('i.imgur.com') ||
    trimmed.includes('pbs.twimg.com') ||
    trimmed.includes('media.giphy.com') ||
    trimmed.includes('upload.wikimedia.org') ||
    trimmed.includes('images.pexels.com') ||
    trimmed.includes('res.cloudinary.com') ||
    trimmed.includes('cdn.discordapp.com') ||
    trimmed.includes('lh3.googleusercontent.com')
  ) {
    return true;
  }
  return false;
}

/**
 * Extract image URL from either explicit mediaUrl or embedded in post content
 */
export function extractPostImage(content?: string, mediaUrl?: string): string | null {
  if (mediaUrl && mediaUrl.trim()) {
    return mediaUrl.trim();
  }

  if (!content || typeof content !== 'string') return null;

  // Check for base64 data URL
  const dataMatch = content.match(DATA_IMAGE_REGEX);
  if (dataMatch && dataMatch[0]) {
    return dataMatch[0];
  }

  // Check for image URLs ending with image extensions
  const extMatch = content.match(IMAGE_IN_TEXT_REGEX);
  if (extMatch && extMatch[0]) {
    return extMatch[0];
  }

  // Check for popular image CDN URLs
  const cdnMatch = content.match(IMAGE_CDN_REGEX);
  if (cdnMatch && cdnMatch[0]) {
    return cdnMatch[0];
  }

  return null;
}

/**
 * Clean post text by optionally hiding or shortening raw image URLs if already rendered as media
 */
export function formatPostText(content: string, extractedImgUrl?: string | null): string {
  if (!content) return '';
  if (extractedImgUrl && content.trim() === extractedImgUrl.trim()) {
    return '';
  }
  return content;
}
