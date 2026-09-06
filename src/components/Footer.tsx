import React from 'react';
import { Shield, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-border-glass-dark py-6 px-4 sm:px-8 text-xs text-outline select-none">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span className="font-semibold">Krono Protocol</span>
          <span className="text-outline">·</span>
          <span className="text-outline">45/45/10 Revenue Split</span>
        </div>

        <div className="flex items-center gap-6 text-outline">
          <span>Decentralized Creator Network</span>
          <span>Zero Platform Rake</span>
        </div>
      </div>
    </footer>
  );
};
