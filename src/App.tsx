import React, { useState, useEffect } from 'react';
import packagesData from './data/packages.json';
import { Package, ConfirmedBooking } from './types';
import { Navigation } from './components/Navigation';
import { Panorama360 } from './components/Panorama360';
import { PackagesSection } from './components/PackagesSection';
import { PhotoShowcase } from './components/PhotoShowcase';
import { BookingFlow } from './components/BookingFlow';
import { MyBookings } from './components/MyBookings';
import { TicketModal } from './components/TicketModal';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { SnowEffect } from './components/SnowEffect';
import { NotFound } from './components/NotFound';
import { HolidayMusicPlayer } from './components/HolidayMusicPlayer';
import { AuthModal } from './components/AuthModal';
import { auth, recordUserLogin, testFirestoreConnection } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Ticket,
  ChevronDown,
  Music,
  Database
} from 'lucide-react';

export default function App() {
  const packages: Package[] = packagesData as Package[];

  // App State
  const [activeSection, setActiveSection] = useState<string>('hero-3d');
  const [currentView, setCurrentView] = useState<'main' | 'my-bookings' | 'not-found'>('main');
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState<ConfirmedBooking | null>(null);
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [preselectedPackageId, setPreselectedPackageId] = useState<string>(packages[0]?.id || '');
  const [snowEnabled, setSnowEnabled] = useState<boolean>(true);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Monitor Auth state & test Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Record login information in Firestore
        recordUserLogin(user).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync booking count from localStorage
  const updateBookingCount = () => {
    try {
      const dataStr = localStorage.getItem('nyc_holiday_my_bookings');
      if (dataStr) {
        const list = JSON.parse(dataStr);
        setBookingCount(Array.isArray(list) ? list.length : 0);
      } else {
        setBookingCount(0);
      }
    } catch {
      setBookingCount(0);
    }
  };

  useEffect(() => {
    updateBookingCount();
  }, []);

  // Smooth scroll and view handler
  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'my-bookings') {
      setCurrentView('my-bookings');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView !== 'main') {
      setCurrentView('main');
      // allow state to render main then scroll
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setActiveSection(sectionId);
  };

  // When user clicks "Book Now" from 3D panorama or package cards
  const handleBookNow = (packageId: string) => {
    setPreselectedPackageId(packageId);
    if (currentView !== 'main') setCurrentView('main');
    setTimeout(() => {
      const bookingEl = document.getElementById('booking');
      if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // When user clicks "View in 3D" from package card
  const handleExploreIn3D = (pkg: Package) => {
    if (currentView !== 'main') setCurrentView('main');
    setTimeout(() => {
      const heroEl = document.getElementById('hero-3d');
      if (heroEl) heroEl.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // When booking is successfully confirmed
  const handleBookingConfirmed = (confirmedBooking: ConfirmedBooking) => {
    updateBookingCount();
    setSelectedBookingForTicket(confirmedBooking);
  };

  // ScrollSpy to update active section in navbar
  useEffect(() => {
    if (currentView !== 'main') return;

    const sections = ['hero-3d', 'packages', 'showcase', 'booking', 'faq', 'contact'];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0B132B]">
      
      {/* Festive Falling Snow Particle Canvas */}
      <SnowEffect enabled={snowEnabled} />

      {/* Sticky Header Navigation */}
      <Navigation
        activeSection={currentView === 'my-bookings' ? 'my-bookings' : activeSection}
        onNavigate={handleNavigate}
        bookingCount={bookingCount}
        snowEnabled={snowEnabled}
        onToggleSnow={() => setSnowEnabled(!snowEnabled)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pt-18 sm:pt-20">
        
        {currentView === 'my-bookings' ? (
          <MyBookings
            onSelectBookingForTicket={(b) => setSelectedBookingForTicket(b)}
            onNavigateToBooking={() => handleNavigate('booking')}
            currentUser={currentUser}
          />
        ) : currentView === 'not-found' ? (
          <NotFound onReturnHome={() => setCurrentView('main')} />
        ) : (
          /* Main Landing Experience */
          <>
            {/* HERO SECTION: 3D Times Square Panorama */}
            <section id="hero-3d" className="relative w-full pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              
              {/* Hero Title & Value Proposition */}
              <div className="text-center max-w-3xl mx-auto mb-8">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1C2541]/90 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-semibold shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Winter Holiday Season in Manhattan 2026</span>
                  </div>

                  {/* Mistletoe music announcement badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E2A2B]/40 border border-[#9E2A2B]/60 text-slate-200 text-xs font-medium backdrop-blur-md">
                    <Music className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                    <span>Justin Bieber – Mistletoe Live Radio</span>
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15] mb-4">
                  Experience New York City in <span className="gold-gradient-text">Holiday Wonder</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Step directly into our interactive 360° Times Square panorama. Look around the glowing marquees, explore landmark holiday packages, and book your all-inclusive Manhattan winter escape.
                </p>

                {/* Quick Feature Stats */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Free 24h Cancellation</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-[#D4AF37]" />
                    <span>Instant PDF & QR Tickets</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#D4AF37]" />
                    <span>Firestore Database Login & Passes</span>
                  </span>
                </div>
              </div>

              {/* 3D 360 Times Square Equirectangular Viewer */}
              <div className="relative">
                <Panorama360
                  packages={packages}
                  onSelectPackage={(pkg) => handleBookNow(pkg.id)}
                  onBookNow={handleBookNow}
                />
              </div>

              {/* Quick Jump Bar */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleNavigate('packages')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#F3E5AB] transition-colors p-2"
                >
                  <span>Explore All 6 Holiday Packages</span>
                  <ChevronDown className="w-4 h-4 text-[#D4AF37] animate-bounce" />
                </button>
              </div>
            </section>

            {/* HOLIDAY PACKAGES SECTION */}
            <PackagesSection
              packages={packages}
              onSelectForBooking={handleBookNow}
              onExploreIn3D={handleExploreIn3D}
            />

            {/* REAL NYC PHOTO SHOWCASE SECTION */}
            <PhotoShowcase
              onBookExperience={handleBookNow}
            />

            {/* INTERACTIVE 6-STEP BOOKING SECTION */}
            <div id="booking">
              <BookingFlow
                packages={packages}
                preselectedPackageId={preselectedPackageId}
                onBookingConfirmed={handleBookingConfirmed}
                onViewMyBookings={() => setCurrentView('my-bookings')}
                currentUser={currentUser}
              />
            </div>

            {/* FREQUENTLY ASKED QUESTIONS */}
            <FaqSection />
          </>
        )}

      </main>

      {/* Global Floating Holiday Music Player (Justin Bieber Mistletoe & Lyria AI) */}
      <HolidayMusicPlayer />

      {/* Firebase Authentication & Stored Login Info Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Global Ticket & E-Voucher Modal */}
      <TicketModal
        booking={selectedBookingForTicket}
        onClose={() => setSelectedBookingForTicket(null)}
      />

      {/* Comprehensive Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenMyBookings={() => {
          setCurrentView('my-bookings');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}
