import React, { useState } from 'react';
import { Package } from '../types';
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface PackagesSectionProps {
  packages: Package[];
  onSelectForBooking: (packageId: string) => void;
  onExploreIn3D: (packageItem: Package) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  onSelectForBooking,
  onExploreIn3D
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Iconic Landmarks', 'Festive Broadway', 'Romantic Winter', 'Family Holiday'];

  const filtered = selectedCategory === 'All' 
    ? packages 
    : packages.filter(p => p.category === selectedCategory);

  return (
    <section id="packages" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block mb-2">
            Curated Holiday Itineraries
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
            Exclusive NYC Holiday Packages
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Each all-inclusive package combines premium Broadway theater or landmark passes, luxury Manhattan accommodations, private tours, and 24/7 festive concierge service.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#1C2541]/70 rounded-xl border border-white/10 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-[#0B132B] shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((pkg) => (
          <div
            key={pkg.id}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-1"
          >
            {/* Image Header */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-black/30" />

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#0B132B]/85 text-[#F3E5AB] border border-[#D4AF37]/40 backdrop-blur-md">
                  {pkg.badge || pkg.category}
                </span>

                <button
                  onClick={() => onExploreIn3D(pkg)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-white bg-black/60 hover:bg-black/90 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md transition-colors"
                  title="View this landmark in 3D Times Square"
                >
                  <Compass className="w-3 h-3 text-[#D4AF37]" />
                  <span>3D View</span>
                </button>
              </div>

              {/* Bottom photo stats */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1 text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {pkg.duration}
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {pkg.rating} ({pkg.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                  {pkg.category}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-0.5 leading-snug group-hover:text-[#F3E5AB] transition-colors">
                  {pkg.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Package Inclusions
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {pkg.highlights.slice(0, 3).map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing & CTA */}
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Starting From
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-bold text-[#F3E5AB]">
                      ${pkg.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ${pkg.originalPrice}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectForBooking(pkg.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] hover:from-[#E5C158] hover:to-[#D4AF37] shadow-md transition-all active:scale-95"
                >
                  <span>Book Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Photo credit small line */}
            <div className="px-6 py-2 bg-black/30 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center">
              <span>Photo: {pkg.imageCredit.photographer} ({pkg.imageCredit.source})</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Guaranteed Best Price
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
