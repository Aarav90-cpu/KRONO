import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  Check,
  RotateCcw,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface ChangePfpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  userName?: string;
  userEmail?: string;
  googlePhotoUrl?: string;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void> | void;
}

// Curated high-resolution avatar presets
const PRESET_AVATARS = [
  {
    name: 'Tech Architect',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Urban Creator',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'AI Researcher',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cyberpunk Lead',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Design Systems',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cryptographer',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimalist Monolith',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Systems Engineer',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  },
];

// Generative avatar seeds & styles
const GENERATIVE_STYLES = [
  'bottts',
  'lorelei',
  'notionists',
  'adventurer',
  'thumbs',
  'pixel-art',
];

export const ChangePfpModal: React.FC<ChangePfpModalProps> = ({
  isOpen,
  onClose,
  currentAvatar = '',
  userName = 'User',
  userEmail: _userEmail = '',
  googlePhotoUrl = '',
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'generate' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [genSeed, setGenSeed] = useState<string>(
    userName.replace(/[^a-zA-Z0-9]/g, '') || 'krono-avatar'
  );
  const [genStyle, setGenStyle] = useState<string>('bottts');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process and downscale uploaded image to a 256x256 WebP or JPEG data URL under 30KB
  const processImageFile = (file: File) => {
    setErrorMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size >= 100 * 1024 * 1024) {
      setErrorMsg(
        `Image exceeds the 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select an image under 100MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setErrorMsg('Failed to process image canvas.');
          return;
        }

        // Center crop to square
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        // Export as WebP or JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(compressedDataUrl);
      };
      img.onerror = () => {
        setErrorMsg('Failed to load image for processing.');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setSelectedAvatar(customUrl.trim());
    setErrorMsg('');
  };

  const generateRandomSeed = () => {
    const random = Math.random().toString(36).substring(2, 8);
    setGenSeed(random);
    const newUrl = `https://api.dicebear.com/7.x/${genStyle}/svg?seed=${random}`;
    setSelectedAvatar(newUrl);
  };

  const handleSelectGenerative = (style: string) => {
    setGenStyle(style);
    const newUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${genSeed}`;
    setSelectedAvatar(newUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSaveAvatar(selectedAvatar);
      onClose();
    } catch (err: any) {
      console.error('Error saving avatar:', err);
      setErrorMsg(err.message || 'Failed to update profile picture.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="change-pfp-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="change-pfp-modal-dialog"
        className="w-full max-w-lg rounded-2xl bg-surface border border-border-glass-dark shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-glass-dark">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Update Profile Picture</h2>
              <p className="text-xs text-outline">Personalize your decentralized identity</p>
            </div>
          </div>
          <button
            id="close-change-pfp-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-border-glass-dark flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <UserAvatar
                src={selectedAvatar}
                name={userName}
                size="lg"
                className="ring-2 ring-primary/40 ring-offset-2 ring-offset-surface shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary text-white text-[10px] shadow-sm">
                <Check className="w-2.5 h-2.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-on-surface">New Profile Picture</div>
              <div className="text-[11px] text-outline font-mono truncate max-w-[220px]">
                {selectedAvatar ? 'Custom avatar selected' : 'Initial monogram avatar'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {googlePhotoUrl && (
              <button
                type="button"
                id="reset-google-pfp-btn"
                onClick={() => setSelectedAvatar(googlePhotoUrl)}
                title="Restore Google Profile Photo"
                className="px-2.5 py-1.5 rounded-lg bg-surface border border-border-glass-dark text-[11px] font-medium text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-secondary" />
                <span className="hidden sm:inline">Google Photo</span>
              </button>
            )}
            <button
              type="button"
              id="remove-pfp-btn"
              onClick={() => setSelectedAvatar('')}
              title="Remove profile picture"
              className="p-1.5 rounded-lg border border-border-glass-dark text-outline hover:text-error hover:border-error/40 hover:bg-error/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-glass-dark px-6 bg-surface">
          <button
            id="pfp-tab-presets"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated</span>
          </button>
          <button
            id="pfp-tab-upload"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          <button
            id="pfp-tab-generate"
            onClick={() => setActiveTab('generate')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'generate'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generative</span>
          </button>
          <button
            id="pfp-tab-url"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Web URL</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div>
              <div className="text-xs font-medium text-outline mb-3">
                Choose from community & cyberpunk avatar styles:
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(preset.url)}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                          : 'border-border-glass-dark hover:border-outline hover:bg-surface-container'
                      }`}
                    >
                      <UserAvatar src={preset.url} name={preset.name} size="md" />
                      <span className="text-[10px] text-outline group-hover:text-on-surface font-medium truncate w-full text-center">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD LOCAL FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border-glass-dark hover:border-primary/60 hover:bg-surface-container'
                }`}
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-on-surface mb-1">
                  Click to choose a photo or drag & drop here
                </div>
                <div className="text-[11px] text-outline max-w-xs">
                  Supports PNG, JPG, or WebP. The photo will be automatically cropped to a square and optimized for decentralized storage.
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="text-[11px] text-outline flex items-center gap-1.5 justify-center">
                <ImageIcon className="w-3.5 h-3.5 text-secondary" />
                <span>Optimized resolution: 256x256 • Instant client compression</span>
              </div>
            </div>
          )}

          {/* TAB 3: GENERATIVE AVATARS */}
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface">Avatar Archetypes</span>
                <button
                  type="button"
                  id="randomize-avatar-btn"
                  onClick={generateRandomSeed}
                  className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-border-glass-dark text-xs font-medium text-primary flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Randomize Seed</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {GENERATIVE_STYLES.map((style) => {
                  const previewUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${genSeed}`;
                  const isSelected = genStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleSelectGenerative(style)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                          : 'border-border-glass-dark hover:border-outline hover:bg-surface-container'
                      }`}
                    >
                      <img
                        src={previewUrl}
                        alt={style}
                        className="w-10 h-10 rounded-full bg-surface-container object-contain"
                      />
                      <span className="text-[10px] text-outline capitalize truncate w-full text-center">
                        {style}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-xs text-outline block">Custom Seed Phrase</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={genSeed}
                    onChange={(e) => {
                      setGenSeed(e.target.value);
                      setSelectedAvatar(
                        `https://api.dicebear.com/7.x/${genStyle}/svg?seed=${encodeURIComponent(
                          e.target.value || 'seed'
                        )}`
                      );
                    }}
                    placeholder="Enter any word or nickname..."
                    className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEB URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Direct Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-outline">
                Paste any publicly accessible image link from Imgur, GitHub, Unsplash, or personal hosting.
              </p>
            </form>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border-glass-dark bg-surface-container-low flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-glass-dark text-outline hover:text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="apply-new-pfp-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Save Profile Picture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
