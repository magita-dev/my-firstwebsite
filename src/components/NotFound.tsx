import React from 'react';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onReturnHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="glass-panel rounded-2xl p-8 sm:p-12 max-w-lg text-center space-y-6 border border-[#D4AF37]/30 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-[#1C2541] border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37]">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block mb-1">
            Error 404
          </span>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            Lost in Times Square?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The page or destination you are searching for might have moved, or you may have taken an unexpected turn down Broadway. Let’s guide you back to the festive holiday lights!
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={onReturnHome}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#E5C158] hover:shadow-lg transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Holiday Showcase</span>
          </button>
        </div>
      </div>
    </div>
  );
};
