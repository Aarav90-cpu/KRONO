import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-border-glass-dark py-6 px-4 sm:px-8 text-xs text-outline select-none bg-surface/50">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="font-bold tracking-tight">KRONO</span>
          <span className="text-outline">·</span>
          <span className="text-outline text-xs">Open Source Social Platform</span>
        </div>

        <div className="flex items-center gap-5 text-xs text-outline">
          <a href="#" className="hover:text-on-surface transition-colors">About</a>
          <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
          <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
          <a href="#" className="hover:text-on-surface transition-colors">Community</a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
