import React, { useState, useRef } from 'react';
import { X, Image, Send, Upload, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { Post, AuthUserProfile } from '../types';
import { UserAvatar } from './UserAvatar';
import { uploadImageToBackend, MAX_ALLOWED_IMAGE_SIZE_BYTES } from '../services/api';
import { extractPostImage } from '../utils/mediaUtils';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (post: Partial<Post>, quoteOriginalPostId?: string) => void;
  currentUser?: AuthUserProfile | null;
  quotingPost?: Post | null;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
  currentUser,
  quotingPost,
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSizeText, setImageSizeText] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setImageError(null);

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    // Strict 100MB size limit check
    if (file.size >= MAX_ALLOWED_IMAGE_SIZE_BYTES) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setImageError(`Image (${sizeInMb} MB) exceeds the 100MB limit. Please upload an image smaller than 100MB.`);
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2);
    setImageSizeText(`${sizeFormatted} MB`);
    setIsUploading(true);

    try {
      const result = await uploadImageToBackend(file);
      setMediaUrl(result.url);
      setShowMediaInput(true);
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset file input value so selecting the same file again triggers onChange
    if (e.target) e.target.value = '';
  };

  const handleAddTag = () => {
    let clean = tagInput.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!customTags.includes(clean)) {
      setCustomTags([...customTags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((t) => t !== tagToRemove));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleProcessFile(file);
          return;
        }
      }
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isUploading) return;

    // Extract hashtags dynamically from text
    const textTags = content.match(/#([a-zA-Z0-9_\u0080-\uFFFF]+)/g) || [];
    const allTags = Array.from(new Set([...customTags, ...textTags]));

    let finalMedia = mediaUrl.trim() || undefined;
    if (!finalMedia) {
      const detected = extractPostImage(content);
      if (detected) finalMedia = detected;
    }

    onSubmitPost(
      {
        content: content.trim(),
        mediaUrl: finalMedia,
        tags: allTags.length > 0 ? allTags : undefined,
      },
      quotingPost ? quotingPost.id : undefined
    );

    setContent('');
    setMediaUrl('');
    setShowMediaInput(false);
    setImageError(null);
    setImageSizeText(null);
    setCustomTags([]);
    onClose();
  };

  const displayName = currentUser?.name || 'You';
  const displayAvatar = currentUser?.avatar || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border-glass-dark p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-glass-dark">
          <h2 className="text-sm font-bold text-on-surface">
            {quotingPost ? 'Quote Post' : 'Create New Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Composer */}
        <form onSubmit={handlePublish} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <UserAvatar src={displayAvatar} name={displayName} size="md" />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                rows={3}
                autoFocus
                placeholder={quotingPost ? 'Add your commentary on this post...' : "What's happening? Share thoughts, updates, or links..."}
                className="w-full bg-transparent border-0 text-sm text-on-surface placeholder:text-outline focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Quoting Post Embedded Preview */}
          {quotingPost && (
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-glass-dark flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <UserAvatar
                  src={quotingPost.author.avatar}
                  name={quotingPost.author.name}
                  size="xs"
                />
                <span className="text-xs font-semibold text-on-surface">
                  {quotingPost.author.name}
                </span>
                <span className="text-[11px] text-outline font-mono">
                  {quotingPost.author.handle}
                </span>
              </div>
              <p className="text-xs text-on-surface line-clamp-3 leading-relaxed">
                {quotingPost.content}
              </p>
              {quotingPost.mediaUrl && (
                <div className="mt-1 rounded-lg overflow-hidden max-h-28 border border-border-glass-dark">
                  <img
                    src={quotingPost.mediaUrl}
                    alt="Quoted attachment"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Image error warning if file >= 100MB */}
          {imageError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="leading-snug">{imageError}</span>
            </div>
          )}

          {/* Media Section: Upload file or URL */}
          {showMediaInput && (
            <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-surface-container-low border border-border-glass-dark">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface">Attach Image</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface-container text-outline">
                    Max 100MB
                  </span>
                </div>
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('');
                      setImageSizeText(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Upload trigger button & hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface border border-border-glass-dark hover:border-primary/50 text-xs font-medium text-on-surface flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Validating & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Upload from Device (&lt;100MB)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Or URL input */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-outline">Or enter image URL directly</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-2 text-xs rounded-lg bg-surface border border-border-glass-dark text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Preview */}
              {mediaUrl && (
                <div className="relative mt-1 rounded-lg overflow-hidden border border-border-glass-dark max-h-48 bg-surface-container flex flex-col">
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover max-h-48"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {imageSizeText && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] text-white font-mono">
                      Size: {imageSizeText} (&lt; 100MB limit)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Optional custom tags */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {customTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add #hashtag (optional)"
                className="px-2.5 py-1 text-xs rounded-full bg-surface-container border border-border-glass-dark text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50"
              />
              {tagInput.trim() && (
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="text-xs text-primary font-semibold px-1.5 py-0.5 rounded hover:bg-surface-container cursor-pointer"
                >
                  + Add
                </button>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-border-glass-dark">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  showMediaInput ? 'bg-primary/20 text-primary' : 'text-outline hover:text-on-surface hover:bg-surface-container'
                }`}
                title="Attach image (<100MB)"
              >
                <Image className="w-4 h-4" />
                <span className="hidden sm:inline">Image (&lt;100MB)</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!content.trim() || isUploading}
                className="px-5 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Publish</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
