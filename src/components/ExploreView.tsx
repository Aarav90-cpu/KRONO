import React, { useState } from 'react';
import {
  Grid,
  Sparkles,
  ExternalLink,
  Code,
  Search,
} from 'lucide-react';

interface ExploreViewProps {
  onOpenRemixModal: () => void;
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onOpenRemixModal,
  onNotify,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'shaders' | 'audio' | 'ai'>('all');
  const [search, setSearch] = useState('');

  const items = [
    {
      id: 'exp-1',
      title: 'Real-Time Fluid Vertex Deformation',
      category: 'shaders',
      author: '@valeria',
      fps: '120 FPS',
      forks: 96,
      yield: '+$142.50',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5BJOp1UWJFutocVw03ynbgHglUyi4WwRooLo7gJ1gWPjia-mn-1biPpIQIofHACTX1GPUQg90xZUlLSXD1WnUX3GuS22FeoJGaAzN44y3Y7F_HpfWQYD8iSdnfpkPWfVVI4zlvCPpoHXM0v4-Ag9gM1I92Vu-gFdTZ4yF0Oa_SRUHuEAQq5KTONRsS3IJ9ZjR-1fUVK6Xfx2EcEOI06FeKVsmT7rft9r4VbbvyuL3306Qk7Py1_5fgg',
    },
    {
      id: 'exp-2',
      title: 'NeuroPulse Decentralized GPU Cluster',
      category: 'ai',
      author: '@neuropulse',
      fps: '18k NODES',
      forks: 24,
      yield: '+$446.40',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSmDerXdhLgncWO2uRkXrUCyMgBolgH98bIN8o60kPq8vAnG2lZ2RrXKSD_vCsF17pY0Twk1ioNrstBEOXk_NdkLjAIcO_naKc8y-7yXExQBOv-aBAVDyNSI1ORR5zC_mCz85vvknI6OyXu3srPS1CWYuOIcOZPlTX8817AuqAavIth5KM6tNyH0Z7mFeDk34_DmtqwYfSTRoAKv3SlXE_8SBmtmtcdJ5eqb4wknt9rfATAAT_5cx4NQ',
    },
    {
      id: 'exp-3',
      title: 'Cross-Post Viral Video Auto-Watermarker',
      category: 'audio',
      author: '@v_nova',
      fps: '4K LOSSLESS',
      forks: 142,
      yield: '+$318.40',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClLwGdazsngoGL6SmkqIXfgFsT7N-xAPtNp3m9OZFdQ2W7MiZhnXNvRzGhT2xi7pvKDLR1mNNoddIq-5pnw6OQAOyYnG4_IYOduulcYXfGSsgpp1DwfaSAXw6Jrk39RkpRGc-y8dGYMKxapr2lzj9tnCVXCC7XDxkGhigRQUtpC0R4t3v9PkUEA-hzEcdiqvuvwQwbwMXUxfYuvNbficQrlMaYZhj_-elDw7b9H3cDJLVyd3C7IC9fqA',
    },
  ];

  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Media Matrix & Shader Registry
            </h1>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
              12% Secondary Cut
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Fork interactive WebGL shaders, generative pipelines, and decentralized AI nodes. Every derivative locks in royalties to the creator.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['all', 'shaders', 'audio', 'ai'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-primary-container text-white font-semibold'
                  : 'bg-surface-container text-outline hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-surface border border-border-glass-dark flex flex-col justify-between overflow-hidden hover:border-outline/40 transition-colors"
          >
            <div className="relative aspect-video bg-black">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                {item.fps}
              </div>
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-mono">{item.author}</span>
                <span className="text-secondary font-mono font-bold">{item.yield}</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <h3 className="font-semibold text-xs text-on-surface line-clamp-1">
                {item.title}
              </h3>

              <div className="flex items-center justify-between pt-2 border-t border-border-glass-dark text-xs text-outline">
                <span>{item.forks} active forks</span>
                <button
                  onClick={onOpenRemixModal}
                  className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-secondary" />
                  <span>Remix Node</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
