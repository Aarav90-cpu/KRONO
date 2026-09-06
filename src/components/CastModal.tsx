import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Code,
  Send,
} from 'lucide-react';
import { CreatorPost } from '../types';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCast: (post: Partial<CreatorPost>) => void;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  onSubmitCast,
}) => {
  const [content, setContent] = useState('');
  const [includeShader, setIncludeShader] = useState(false);
  const [allowRemix, setAllowRemix] = useState(true);
  const [selectedTag, setSelectedTag] = useState('#WebGL2Pipelines');

  if (!isOpen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitCast({
      content: content.trim(),
      shaderBadge: includeShader
        ? {
            nodeId: 'CUSTOM_SHADER_v01',
            fps: '120.0',
          }
        : undefined,
      mediaUrl: includeShader
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5BJOp1UWJFutocVw03ynbgHglUyi4WwRooLo7gJ1gWPjia-mn-1biPpIQIofHACTX1GPUQg90xZUlLSXD1WnUX3GuS22FeoJGaAzN44y3Y7F_HpfWQYD8iSdnfpkPWfVVI4zlvCPpoHXM0v4-Ag9gM1I92Vu-gFdTZ4yF0Oa_SRUHuEAQq5KTONRsS3IJ9ZjR-1fUVK6Xfx2EcEOI06FeKVsmT7rft9r4VbbvyuL3306Qk7Py1_5fgg'
        : undefined,
    });

    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border-glass-dark p-5 shadow-lg flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-glass-dark">
          <h2 className="text-sm font-bold text-on-surface">New Post</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ"
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="What's happening? Share code, media, or updates..."
                className="w-full bg-surface-container-low border border-border-glass-dark rounded-lg p-3 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 resize-none transition-colors"
                autoFocus
              />

              {/* Tag selector */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {['#WebGL2Pipelines', '#DecentralizedAI', '#HyperLocalBeacon', '#ZeroKnowledge'].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                        selectedTag === tag
                          ? 'bg-primary-container text-white font-medium'
                          : 'bg-surface-container text-outline hover:text-on-surface'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Toggle options */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-border-glass-dark flex flex-col gap-2 text-xs">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeShader}
                  onChange={(e) => setIncludeShader(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
                <Code className="w-4 h-4 text-primary" />
                <span className="text-on-surface">Attach Interactive GLSL / WebGL Shader Node</span>
              </div>
              {includeShader && (
                <span className="text-[10px] text-secondary font-mono font-medium">120 FPS</span>
              )}
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowRemix}
                  onChange={(e) => setAllowRemix(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-on-surface">Allow Peer Remixes (12% Secondary Cut)</span>
              </div>
              <span className="text-[10px] text-secondary font-medium">+12%</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
