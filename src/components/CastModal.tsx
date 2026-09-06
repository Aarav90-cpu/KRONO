import React, { useState } from 'react';
import { X, Image, Hash, Send, Sparkles } from 'lucide-react';
import { Post } from '../types';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (post: Partial<Post>) => void;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [tags, setTags] = useState<string[]>(['#OpenSource']);

  if (!isOpen) return null;

  const popularTags = ['#OpenSource', '#WebDev', '#Design', '#Tech', '#Community'];

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitPost({
      content: content.trim(),
      mediaUrl: mediaUrl.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    setContent('');
    setMediaUrl('');
    setShowMediaInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border-glass-dark p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-glass-dark">
          <h2 className="text-sm font-bold text-on-surface">Create New Post</h2>
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
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ"
              alt="You"
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                autoFocus
                placeholder="What's happening? Share thoughts, questions, or updates..."
                className="w-full bg-transparent border-0 text-sm text-on-surface placeholder:text-outline focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Media URL input if toggled */}
          {showMediaInput && (
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low border border-border-glass-dark">
              <label className="text-xs text-outline font-medium">Add Image URL</label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 text-xs rounded-lg bg-surface border border-border-glass-dark text-on-surface focus:outline-none focus:border-primary"
              />
              {mediaUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border-glass-dark max-h-40">
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tag selector */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-outline mr-1">Tags:</span>
            {popularTags.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface-container text-outline hover:text-on-surface'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-border-glass-dark">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  showMediaInput ? 'bg-primary/20 text-primary' : 'text-outline hover:text-on-surface hover:bg-surface-container'
                }`}
                title="Attach photo/media"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-outline">
                {280 - content.length} left
              </span>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-5 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
