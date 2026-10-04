import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Heart
} from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenMyBookings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenMyBookings }) => {
  return (
    <footer id="contact" className="w-full bg-[#050814] border-t border-[#D4AF37]/30 text-slate-300 text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#9E2A2B] flex items-center justify-center p-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-tight">
                Holiday in New York
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Manhattan’s premier seasonal booking platform. Curating festive holidays, private ice skating, Broadway orchestra tickets, and luxury hotel packages since 2018.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official NYC Tourism Licensed Partner</span>
            </div>
          </div>

          {/* Col 2: Holiday Packages */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider text-[#D4AF37]">
              Holiday Packages
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate('packages')} 
                  className="hover:text-[#F3E5AB] transition-colors text-left"
                >
                  Broadway Holiday Magic VIP
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('packages')} 
                  className="hover:text-[#F3E5AB] transition-colors text-left"
                >
                  Rockefeller Center Tree & Skating Gala
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('packages')} 
                  className="hover:text-[#F3E5AB] transition-colors text-left"
                >
                  Central Park Winter Carriage & Romance
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('packages')} 
                  className="hover:text-[#F3E5AB] transition-colors text-left"
                >
                  Statue of Liberty Holiday Harbor Cruise
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('packages')} 
                  className="hover:text-[#F3E5AB] transition-colors text-left"
                >
                  Empire State Festive Skyline Tour
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('packages')} 
                  className="hover:text-[#F3E5AB] transition-colors text-left"
                >
                  Manhattan Family Winter Wonderland
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation & Services */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider text-[#D4AF37]">
              Guest Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('hero-3d')} className="hover:text-[#F3E5AB] transition-colors text-left">
                  3D Times Square Panorama
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('booking')} className="hover:text-[#F3E5AB] transition-colors text-left">
                  Book Holiday Package
                </button>
              </li>
              <li>
                <button onClick={onOpenMyBookings} className="hover:text-[#F3E5AB] transition-colors text-left">
                  Manage My Bookings & Tickets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('showcase')} className="hover:text-[#F3E5AB] transition-colors text-left">
                  Real NYC Photo Showcase
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#F3E5AB] transition-colors text-left">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <span className="text-slate-500">24-Hour Free Cancellation Policy</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Concierge */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider text-[#D4AF37]">
              Concierge Contact
            </h4>
            <div className="space-y-2.5 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>350 Fifth Avenue, Suite 4100, New York, NY 10118</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>+1 (212) 555-0199</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>concierge@holidayinnewyork.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Daily: 8:00 AM – 10:00 PM EST</span>
              </div>
            </div>
          </div>

        </div>

        {/* Real Photography Credits & Licensing Disclosure */}
        <div className="py-6 border-b border-white/10 space-y-2">
          <h5 className="font-bold text-white text-[11px] uppercase tracking-wider text-[#D4AF37]">
            Photography & Asset Licensing Credits
          </h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All photography displayed across this website and within generated PDF tickets consists strictly of real authentic photographs taken in New York City (no AI-generated imagery or stock vectors). Sourced under Unsplash and Pexels open commercial licenses:
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span>• <strong>Times Square 360 Panorama:</strong> Wikimedia Commons / Public Domain</span>
            <span>• <strong>Rockefeller Tree:</strong> Michael Discenza (Unsplash)</span>
            <span>• <strong>Central Park Snow:</strong> Jermaine Ee (Unsplash)</span>
            <span>• <strong>Broadway Marquee:</strong> Denys Nevozhai (Unsplash)</span>
            <span>• <strong>Statue of Liberty:</strong> Anthony Fomin (Unsplash)</span>
            <span>• <strong>Fifth Avenue Windows:</strong> Florian Wehde (Unsplash)</span>
            <span>• <strong>Empire State:</strong> Kit Suman (Unsplash)</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © 2026 Holiday in New York. All rights reserved. Crafted with care for winter in Manhattan.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">Demo Booking System Active</span>
            <span>·</span>
            <span className="text-slate-400">WCAG AA Compliant</span>
            <span>·</span>
            <span className="text-slate-400">Three.js WebGL</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
