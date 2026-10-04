import React, { useState } from 'react';
import { Sparkles, MapPin, ExternalLink, ArrowRight, Eye } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  imageUrl: string;
  packageIdTarget: string;
  photographer: string;
  source: string;
  sourceUrl: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'rockefeller',
    title: 'Rockefeller Center Christmas Tree & Rink',
    location: '45 Rockefeller Plaza, Manhattan',
    category: 'Iconic Holiday Tradition',
    description: 'An 80-foot Norway Spruce adorned with 50,000 multi-colored LED lights and crowned with a 900-pound Swarovski crystal star overlooking the world’s most celebrated ice rink.',
    imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1600&q=80',
    packageIdTarget: 'rockefeller-christmas',
    photographer: 'Michael Discenza',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/MxfcoxycH_Y'
  },
  {
    id: 'central-park',
    title: 'Central Park Snowbound Bow Bridge',
    location: 'Central Park West & 72nd St',
    category: 'Winter Wonderland',
    description: 'Fresh powdery snow blankets the Victorian cast-iron span of Bow Bridge, reflecting serene morning frost amidst peaceful elm paths and horse-drawn carriages.',
    imageUrl: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=80',
    packageIdTarget: 'central-park-winter',
    photographer: 'Jermaine Ee',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/g39p1kDjvSY'
  },
  {
    id: 'brooklyn-bridge',
    title: 'Brooklyn Bridge & Illuminated Skyline',
    location: 'East River Promenade',
    category: 'Architectural Splendor',
    description: 'Gothic stone arches framing the sparkling towers of Lower Manhattan, glowing against frosty winter sunsets over the East River with holiday harbor vessels.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80',
    packageIdTarget: 'statue-liberty-cruise',
    photographer: 'Alexander Rotker',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/l9AIdMg8pms'
  },
  {
    id: 'fifth-ave',
    title: 'Fifth Avenue Holiday Windows & Light Show',
    location: 'Fifth Avenue (49th to 58th St)',
    category: 'Holiday Glamour',
    description: 'Saks Fifth Avenue, Bergdorf Goodman, and Tiffany & Co. unveil mesmerizing mechanical holiday display windows synchronized to ten-story musical facade light shows.',
    imageUrl: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1600&q=80',
    packageIdTarget: 'rockefeller-christmas',
    photographer: 'Florian Wehde',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/1Bf83r2D9wU'
  },
  {
    id: 'times-square-night',
    title: 'Times Square Neon & Broadway Glow',
    location: 'Broadway & 42nd to 47th St',
    category: 'The Crossroads of the World',
    description: 'Billions of lumens reflect off December sidewalks as theatergoers flock to festive Broadway marquees, creating an electrifying winter atmosphere unmatched anywhere on earth.',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1600&q=80',
    packageIdTarget: 'broadway-magic',
    photographer: 'Denys Nevozhai',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/7nrsVjvALnA'
  }
];

interface PhotoShowcaseProps {
  onBookExperience: (packageId: string) => void;
}

export const PhotoShowcase: React.FC<PhotoShowcaseProps> = ({ onBookExperience }) => {
  const [activeItem, setActiveItem] = useState<ShowcaseItem>(SHOWCASE_ITEMS[0]);

  return (
    <section id="showcase" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block mb-2">
          Real Photography · No Stock AI
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">
          Experience the Real Magic of New York
        </h2>
        <p className="text-sm text-slate-300">
          From sparkling tree lightings to cozy snowy strolls, immerse yourself in authentic seasonal views captured across Manhattan.
        </p>
      </div>

      {/* Featured Big Stage Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl h-[420px] sm:h-[500px] mb-6">
        <img
          src={activeItem.imageUrl}
          alt={activeItem.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0B132B]/80 px-2.5 py-1 rounded-md border border-[#D4AF37]/40 backdrop-blur-md">
                {activeItem.category}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                {activeItem.location}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {activeItem.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 sm:line-clamp-none leading-relaxed">
              {activeItem.description}
            </p>

            <p className="text-[11px] text-slate-400">
              Photo by <span className="text-slate-200">{activeItem.photographer}</span> ({activeItem.source})
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onBookExperience(activeItem.packageIdTarget)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] hover:shadow-lg transition-all active:scale-95"
            >
              <span>Book Related Package</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SHOWCASE_ITEMS.map((item) => {
          const isActive = activeItem.id === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item)}
              className={`relative rounded-xl overflow-hidden h-24 sm:h-28 text-left transition-all duration-200 border group ${
                isActive 
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-[1.02]' 
                  : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[10px] font-bold text-[#F3E5AB] block truncate">
                  {item.category}
                </span>
                <span className="text-xs font-serif font-bold text-white block truncate">
                  {item.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
