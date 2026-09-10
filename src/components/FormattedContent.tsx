import React from 'react';

interface FormattedContentProps {
  content: string;
  onTagClick?: (tag: string) => void;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  onTagClick,
  className = '',
}) => {
  if (!content) return null;

  // Tokenize string by URLs and hashtags
  const urlAndTagRegex = /(https?:\/\/[^\s]+|#[a-zA-Z0-9_\u0080-\uFFFF]+)/g;
  const parts = content.split(urlAndTagRegex);

  return (
    <p className={`text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('http://') || part.startsWith('https://')) {
          // If it's an image URL, show shortened display text so post doesn't look cluttered
          const isImg = /\.(?:png|jpe?g|gif|webp|svg)(?:[?#]|$)/i.test(part) ||
            part.includes('images.unsplash.com') ||
            part.includes('i.imgur.com');

          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center gap-0.5 break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {isImg ? (part.length > 35 ? `${part.slice(0, 32)}...` : part) : part}
            </a>
          );
        }

        if (part.startsWith('#') && part.length > 1) {
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(part);
              }}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              {part}
            </button>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </p>
  );
};
