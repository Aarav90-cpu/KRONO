import React, { useState } from 'react';
import { ExternalLink, ImageOff, Maximize2, X } from 'lucide-react';

interface PostMediaProps {
  src: string;
  alt?: string;
  className?: string;
  maxHeightClass?: string;
}

export const PostMedia: React.FC<PostMediaProps> = ({
  src,
  alt = 'Post attachment',
  className = '',
  maxHeightClass = 'max-h-[440px]',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!src) return null;

  if (hasError) {
    return (
      <div className="rounded-xl border border-border-glass-dark bg-surface-container-low p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-outline">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-outline">
            <ImageOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-on-surface block">Image could not be displayed</span>
            <span className="text-[11px] text-outline truncate max-w-xs block">
              The external host may have restricted access or the link expired.
            </span>
          </div>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1.5 transition-colors font-medium shrink-0"
        >
          <span>Open Link</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative group rounded-xl overflow-hidden border border-border-glass-dark bg-surface-container-low transition-all ${maxHeightClass} ${className}`}
      >
        {isLoading && (
          <div className="w-full h-48 bg-surface-container animate-pulse flex items-center justify-center text-outline text-xs">
            Loading image...
          </div>
        )}

        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          crossOrigin="anonymous"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={() => setIsLightboxOpen(true)}
          className={`w-full h-auto object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-200 ${
            isLoading ? 'hidden' : 'block'
          }`}
        />

        {!isLoading && !hasError && (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Expand image"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close image preview"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
};
