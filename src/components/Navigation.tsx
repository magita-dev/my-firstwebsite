import React, { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Sparkles, 
  Menu, 
  X, 
  Ticket, 
  Calendar, 
  Snowflake, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Phone,
  User,
  Database
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  bookingCount: number;
  snowEnabled: boolean;
  onToggleSnow: () => void;
  currentUser: FirebaseUser | null;
  onOpenAuthModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onNavigate,
  bookingCount,
  snowEnabled,
  onToggleSnow,
  currentUser,
  onOpenAuthModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Detect scroll for subtle glass header darkening
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trap focus & close on Escape key for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'hero-3d', label: '3D Times Square' },
    { id: 'packages', label: 'Packages' },
    { id: 'showcase', label: 'Real NYC Sights' },
    { id: 'booking', label: 'Book Package' },
    { id: 'my-bookings', label: 'My Bookings', badge: bookingCount > 0 ? bookingCount : undefined },
    { id: 'contact', label: 'Contact' }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B132B]/95 backdrop-blur-xl border-b border-[#D4AF37]/30 shadow-xl py-3' 
          : 'bg-gradient-to-b from-[#0B132B]/90 via-[#0B132B]/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Zone (Single clean display element) */}
        <button
          onClick={() => handleLinkClick('hero-3d')}
          className="flex items-center gap-2 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg"
          aria-label="Holiday in New York Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#9E2A2B] to-[#1C2541] p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#F3E5AB]" />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-[#F3E5AB] transition-colors block leading-none">
              Holiday in New York
            </span>
            <span className="text-[10px] text-[#D4AF37] tracking-wider uppercase font-semibold">
              Manhattan Travel & 3D Experience
            </span>
          </div>
        </button>

        {/* Desktop Nav Links (Clean typography with subtle underline) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;

            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative py-1 transition-colors hover:text-[#F3E5AB] flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded ${
                  isActive ? 'text-[#F3E5AB]' : 'text-slate-300'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="w-4 h-4 rounded-full bg-[#9E2A2B] text-white text-[10px] flex items-center justify-center font-bold">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Auth & Login Info Button */}
          <button
            onClick={onOpenAuthModal}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              currentUser 
                ? 'bg-[#1C2541] border-[#D4AF37] text-white' 
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
            }`}
            title={currentUser ? `Logged in as ${currentUser.displayName || currentUser.email}` : 'Sign in with Google (stores login info in Firestore)'}
          >
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-5 h-5 rounded-full object-cover border border-[#D4AF37]" 
              />
            ) : (
              <User className="w-4 h-4 text-[#D4AF37]" />
            )}
            <span className="hidden sm:inline font-semibold">
              {currentUser ? (currentUser.displayName?.split(' ')[0] || 'Profile') : 'Sign In'}
            </span>
          </button>

          {/* Snow Effect Toggle */}
          <button
            onClick={onToggleSnow}
            className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              snowEnabled 
                ? 'bg-[#1C2541] border-[#D4AF37]/50 text-[#F3E5AB]' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={snowEnabled ? 'Disable Falling Snow Effect' : 'Enable Falling Snow Effect'}
            aria-label="Toggle snow animation"
          >
            <Snowflake className={`w-4 h-4 ${snowEnabled ? 'text-[#D4AF37] animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span className="hidden xl:inline text-[11px]">{snowEnabled ? 'Snow: On' : 'Snow: Off'}</span>
          </button>

          {/* Book Now Primary Button */}
          <button
            onClick={() => handleLinkClick('booking')}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#E5C158] hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all active:scale-95"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed inset-x-0 top-[65px] bg-[#0B132B]/98 backdrop-blur-2xl border-b border-[#D4AF37]/40 shadow-2xl p-6 space-y-4 animate-in slide-in-from-top duration-200"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                    isActive 
                      ? 'bg-[#1C2541] text-[#F3E5AB] border border-[#D4AF37]/40' 
                      : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-[#9E2A2B] text-white text-xs flex items-center justify-center font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#1C2541] border border-[#D4AF37]/50"
            >
              <Database className="w-4 h-4 text-[#D4AF37]" />
              <span>{currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign In with Google (Database Auth)'}</span>
            </button>

            <button
              onClick={() => handleLinkClick('booking')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-[#0B132B] bg-[#D4AF37] hover:bg-[#E5C158] transition-colors shadow-lg"
            >
              <span>Instant Package Reservation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
