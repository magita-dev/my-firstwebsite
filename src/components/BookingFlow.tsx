import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { syncBookingToFirestore } from '../lib/firebase';
import { Package, AddOnItem, TravelerInfo, BookingDraft, ConfirmedBooking } from '../types';
import { ADD_ONS, VALID_PROMO_CODES } from '../data/addOns';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Users,
  Sparkles,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building,
  Ticket,
  Car,
  Heart,
  Utensils,
  Clock,
  Star,
  Tag,
  AlertCircle,
  RotateCcw,
  Info
} from 'lucide-react';

interface BookingFlowProps {
  packages: Package[];
  preselectedPackageId?: string;
  onBookingConfirmed: (booking: ConfirmedBooking) => void;
  onViewMyBookings: () => void;
  currentUser?: FirebaseUser | null;
}

const STORAGE_DRAFT_KEY = 'nyc_holiday_booking_draft';

export const BookingFlow: React.FC<BookingFlowProps> = ({
  packages,
  preselectedPackageId,
  onBookingConfirmed,
  onViewMyBookings,
  currentUser
}) => {
  // Find initial package
  const initialPackageId = preselectedPackageId || packages[0]?.id || '';

  // Get tomorrow's date formatted as YYYY-MM-DD
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // State initialization with localStorage draft restore
  const [selectedPkgId, setSelectedPkgId] = useState<string>(initialPackageId);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(getTomorrowDate());
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Traveler Info
  const [travelerInfo, setTravelerInfo] = useState<TravelerInfo>({
    leadName: '',
    email: '',
    phone: '',
    specialRequests: '',
    emergencyContact: '',
    agreedToTerms: false
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Promo Code
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent?: number; discountFlat?: number; description: string } | null>(null);
  const [promoError, setPromoError] = useState<string>('');

  // Demo card inputs
  const [cardName, setCardName] = useState('Jane Doe');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('784');

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (savedDraft) {
        const draft: BookingDraft = JSON.parse(savedDraft);
        if (draft.packageId) setSelectedPkgId(draft.packageId);
        if (draft.startDate) setStartDate(draft.startDate);
        if (draft.adults) setAdults(draft.adults);
        if (draft.children !== undefined) setChildren(draft.children);
        if (draft.infants !== undefined) setInfants(draft.infants);
        if (draft.selectedAddOns) setSelectedAddOnIds(draft.selectedAddOns);
        if (draft.travelerInfo) setTravelerInfo(draft.travelerInfo);
        if (draft.promoCode && VALID_PROMO_CODES[draft.promoCode]) {
          setAppliedPromo({
            code: draft.promoCode,
            ...VALID_PROMO_CODES[draft.promoCode]
          });
        }
        if (draft.step) setCurrentStep(draft.step);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Update selected package if prop changes
  useEffect(() => {
    if (preselectedPackageId) {
      setSelectedPkgId(preselectedPackageId);
    }
  }, [preselectedPackageId]);

  // Prepopulate lead traveler name and email from currentUser if logged in
  useEffect(() => {
    if (currentUser) {
      setTravelerInfo(prev => ({
        ...prev,
        leadName: prev.leadName || currentUser.displayName || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // Save draft to localStorage on change
  useEffect(() => {
    const draft: BookingDraft = {
      packageId: selectedPkgId,
      startDate,
      endDate: calculateEndDate(startDate, selectedPackage?.duration || '4 Days / 3 Nights'),
      adults,
      children,
      infants,
      selectedAddOns: selectedAddOnIds,
      travelerInfo,
      promoCode: appliedPromo?.code || '',
      discountAmount: 0,
      step: currentStep
    };
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage unavailable
    }
  }, [selectedPkgId, startDate, adults, children, infants, selectedAddOnIds, travelerInfo, appliedPromo, currentStep]);

  // Selected package object
  const selectedPackage = packages.find(p => p.id === selectedPkgId) || packages[0];

  // Helper to calculate end date based on package duration string (e.g. "4 Days / 3 Nights" -> +3 days)
  function calculateEndDate(startStr: string, durationStr: string): string {
    const nightsMatch = durationStr.match(/(\d+)\s*Nights?/i);
    const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : 3;
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return startStr;
    start.setDate(start.getDate() + nights);
    return start.toISOString().split('T')[0];
  }

  const endDate = calculateEndDate(startDate, selectedPackage?.duration || '4 Days / 3 Nights');

  // Duration in days
  const getDurationDays = (durationStr: string): number => {
    const daysMatch = durationStr.match(/(\d+)\s*Days?/i);
    return daysMatch ? parseInt(daysMatch[1], 10) : 4;
  };
  const durationDays = getDurationDays(selectedPackage?.duration || '4 Days / 3 Nights');

  // Price calculations
  const basePricePerPerson = selectedPackage?.price || 0;
  // Children receive 25% discount
  const childPricePerPerson = Math.round(basePricePerPerson * 0.75);
  const packageTotal = (adults * basePricePerPerson) + (children * childPricePerPerson);

  // Add-ons total
  const selectedAddOnObjects = ADD_ONS.filter(a => selectedAddOnIds.includes(a.id));
  const addOnsTotal = selectedAddOnObjects.reduce((acc, item) => {
    if (item.priceType === 'per_person') {
      return acc + (item.price * (adults + children));
    }
    if (item.priceType === 'per_night') {
      const nights = Math.max(1, durationDays - 1);
      return acc + (item.price * nights);
    }
    return acc + item.price; // per_booking
  }, 0);

  const subtotalBeforeDiscount = packageTotal + addOnsTotal;

  // Discount calculation
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      discountAmount = Math.round(subtotalBeforeDiscount * (appliedPromo.discountPercent / 100));
    } else if (appliedPromo.discountFlat) {
      discountAmount = Math.min(subtotalBeforeDiscount, appliedPromo.discountFlat);
    }
  }

  const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);
  // NYC Hotel & Sales Tax (8.875%)
  const taxesAndFees = Math.round(subtotalAfterDiscount * 0.08875);
  const grandTotal = subtotalAfterDiscount + taxesAndFees;

  // Toggle add-on
  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Apply promo code
  const handleApplyPromo = () => {
    const trimmed = promoCodeInput.trim().toUpperCase();
    if (!trimmed) return;

    if (VALID_PROMO_CODES[trimmed]) {
      setAppliedPromo({
        code: trimmed,
        ...VALID_PROMO_CODES[trimmed]
      });
      setPromoError('');
      setPromoCodeInput('');
    } else {
      setPromoError('Invalid holiday promo code. Try "NYC2026" or "HOLIDAY25"');
    }
  };

  // Form validation for Step 5 (Traveler Details)
  const validateTravelerDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!travelerInfo.leadName.trim() || travelerInfo.leadName.trim().length < 3) {
      newErrors.leadName = 'Please enter lead traveler’s full name (at least 3 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!travelerInfo.email.trim() || !emailRegex.test(travelerInfo.email)) {
      newErrors.email = 'Please provide a valid email address for ticket delivery';
    }

    const phoneClean = travelerInfo.phone.replace(/\D/g, '');
    if (!travelerInfo.phone.trim() || phoneClean.length < 8) {
      newErrors.phone = 'Please provide a valid contact phone number';
    }

    if (!travelerInfo.agreedToTerms) {
      newErrors.terms = 'Please accept the holiday booking terms and cancellation policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step advancement
  const handleNextStep = () => {
    if (currentStep === 5) {
      const isValid = validateTravelerDetails();
      if (!isValid) return;
    }
    setCurrentStep(prev => Math.min(6, prev + 1));
    window.scrollTo({ top: document.getElementById('booking-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Reset Draft
  const handleResetDraft = () => {
    if (window.confirm('Reset this booking draft and start over?')) {
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      setSelectedPkgId(packages[0]?.id || '');
      setStartDate(getTomorrowDate());
      setAdults(2);
      setChildren(0);
      setInfants(0);
      setSelectedAddOnIds([]);
      setTravelerInfo({
        leadName: '',
        email: '',
        phone: '',
        specialRequests: '',
        emergencyContact: '',
        agreedToTerms: false
      });
      setAppliedPromo(null);
      setCurrentStep(1);
      setErrors({});
    }
  };

  // Auto-fill demo payment info
  const handleAutoFillDemo = () => {
    setCardName(travelerInfo.leadName || 'Jane Doe');
    setCardNumber('4000 1234 5678 9010');
    setCardExp('12/28');
    setCardCvv('892');
  };

  // Complete Booking
  const handleConfirmBooking = () => {
    // Generate unique booking reference ID (e.g. NYC-2026-X8F29Q)
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bookingId = `NYC-2026-${randomHex}`;

    const confirmedItem: ConfirmedBooking = {
      id: bookingId,
      createdAt: new Date().toISOString(),
      packageItem: selectedPackage,
      startDate,
      endDate,
      durationDays,
      adults,
      children,
      infants,
      selectedAddOns: selectedAddOnObjects.map(a => ({
        id: a.id,
        name: a.name,
        cost: a.priceType === 'per_person' ? a.price * (adults + children) : 
              a.priceType === 'per_night' ? a.price * Math.max(1, durationDays - 1) : a.price,
        description: a.description
      })),
      travelerInfo,
      basePrice: basePricePerPerson,
      travelersMultiplierCost: packageTotal,
      addOnsTotal,
      promoCode: appliedPromo?.code,
      discountAmount,
      taxesAndFees,
      grandTotal,
      status: 'Confirmed'
    };

    // Save to completed bookings in localStorage
    try {
      const existingBookingsStr = localStorage.getItem('nyc_holiday_my_bookings');
      const existingBookings: ConfirmedBooking[] = existingBookingsStr ? JSON.parse(existingBookingsStr) : [];
      existingBookings.unshift(confirmedItem);
      localStorage.setItem('nyc_holiday_my_bookings', JSON.stringify(existingBookings));
      // Clear draft
      localStorage.removeItem(STORAGE_DRAFT_KEY);

      // Also persist to Firestore if logged in
      if (currentUser?.uid) {
        syncBookingToFirestore(currentUser.uid, confirmedItem).catch((err) => {
          console.error('Failed to sync booking to Firestore:', err);
        });
      }
    } catch {
      // Storage error
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#9E2A2B', '#FFFFFF', '#1C2541']
      });
    } catch {
      // Confetti fallback
    }

    onBookingConfirmed(confirmedItem);
  };

  // Step names
  const steps = [
    { num: 1, title: 'Package' },
    { num: 2, title: 'Dates' },
    { num: 3, title: 'Travelers' },
    { num: 4, title: 'Add-ons' },
    { num: 5, title: 'Details' },
    { num: 6, title: 'Confirm' }
  ];

  const filteredPackages = categoryFilter === 'All' 
    ? packages 
    : packages.filter(p => p.category === categoryFilter);

  // Icon renderer for add-ons
  const renderAddOnIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building': return <Building className="w-5 h-5 text-[#D4AF37]" />;
      case 'Ticket': return <Ticket className="w-5 h-5 text-[#D4AF37]" />;
      case 'Car': return <Car className="w-5 h-5 text-[#D4AF37]" />;
      case 'Heart': return <Heart className="w-5 h-5 text-[#D4AF37]" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-[#D4AF37]" />;
      default: return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
    }
  };

  return (
    <div id="booking-section" className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-2 block">
          Seamless Online Reservations
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">
          Book Your Holiday in New York
        </h2>
        <p className="text-sm sm:text-base text-slate-300">
          Personalize your itinerary with authentic Broadway shows, 5-star Manhattan accommodations, and festive private experiences.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
        <div className="flex items-center justify-between relative overflow-x-auto pb-2 sm:pb-0">
          {steps.map((st, idx) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div key={st.num} className="flex items-center flex-1 min-w-[75px] last:flex-none">
                <button
                  onClick={() => {
                    if (isCompleted || isCurrent) setCurrentStep(st.num);
                  }}
                  disabled={!isCompleted && !isCurrent}
                  className={`flex flex-col sm:flex-row items-center gap-2 group transition-all text-left ${
                    isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                      ? 'bg-[#D4AF37] text-[#0B132B] ring-4 ring-[#D4AF37]/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                  </span>
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block hidden sm:block">
                      Step {st.num}
                    </span>
                    <span className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent ? 'text-[#F3E5AB]' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                    }`}>
                      {st.title}
                    </span>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`hidden md:block flex-1 h-[2px] mx-3 transition-colors ${
                    currentStep > st.num ? 'bg-emerald-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Booking Content Grid: Form (2 cols) + Live Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: CHOOSE PACKAGE */}
          {currentStep === 1 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    Step 1: Select Your Holiday Package
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Choose from curated holiday experiences across Manhattan
                  </p>
                </div>

                {/* Category Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900/60 rounded-lg border border-white/10 text-xs">
                  {['All', 'Iconic Landmarks', 'Festive Broadway', 'Romantic Winter', 'Family Holiday'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-all ${
                        categoryFilter === cat 
                          ? 'bg-[#D4AF37] text-[#0B132B] font-bold shadow' 
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPackages.map((pkg) => {
                  const isSelected = selectedPkgId === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[#1C2541]/90 border-[#D4AF37] shadow-lg ring-2 ring-[#D4AF37]/40' 
                          : 'bg-[#0B132B]/60 border-white/10 hover:border-white/30 hover:bg-[#1C2541]/40'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                        <img 
                          src={pkg.image} 
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/70 text-[#F3E5AB] border border-[#D4AF37]/40">
                          {pkg.badge || pkg.category}
                        </span>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
                          <span className="flex items-center gap-1 text-[11px] text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {pkg.duration}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {pkg.rating} ({pkg.reviewCount})
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className="font-serif font-bold text-white text-base leading-snug">
                          {pkg.name}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Footer & Selection Indicator */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">From</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-serif font-bold text-[#F3E5AB]">
                              ${pkg.price}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              ${pkg.originalPrice}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            isSelected 
                              ? 'bg-[#D4AF37] text-[#0B132B]' 
                              : 'bg-white/10 text-slate-200 group-hover:bg-white/20'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span>Select Package</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PICK DATES */}
          {currentStep === 2 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 2: Choose Your Holiday Dates
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Selected package duration: <strong className="text-[#F3E5AB]">{selectedPackage?.duration}</strong>
                </p>
              </div>

              {/* Date Selection Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                      Arrival / Check-in Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={getTomorrowDate()}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#0B132B] border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Past dates are blocked. Peak holiday season: Nov 20 – Jan 10.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                      Calculated Departure / Check-out Date
                    </label>
                    <div className="w-full bg-[#0B132B]/60 border border-white/10 rounded-xl px-4 py-3 text-[#F3E5AB] text-sm flex items-center justify-between">
                      <span>{endDate}</span>
                      <span className="text-xs text-slate-400">({durationDays} Days Total)</span>
                    </div>
                  </div>
                </div>

                {/* Holiday Season Perks Box */}
                <div className="bg-[#1C2541]/70 border border-[#D4AF37]/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="font-serif font-bold text-sm text-white">
                      Peak Holiday Festivities
                    </h4>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Rockefeller Tree Lighting:</strong> Illuminated every evening from late November through mid-January.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Bryant Park Winter Village:</strong> Complimentary rink access and 170+ artisanal holiday stalls open daily.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Flexible Weather Guarantee:</strong> Free 24-hour itinerary rescheduling for snow storms.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TRAVELERS */}
          {currentStep === 3 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 3: Number of Travelers
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Ticket pricing updates in real-time based on your party composition
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                {/* Adults */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B132B]/80 border border-white/10">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Adults (Age 13+)</h4>
                    <p className="text-xs text-slate-400">Standard holiday package rate (${basePricePerPerson}/person)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                      disabled={adults <= 1}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold"
                      aria-label="Decrease Adults"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-base text-[#F3E5AB]">
                      {adults}
                    </span>
                    <button
                      onClick={() => setAdults(prev => Math.min(12, prev + 1))}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                      aria-label="Increase Adults"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B132B]/80 border border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">Children (Ages 2–12)</h4>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                        25% OFF
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Discounted child rate (${childPricePerPerson}/child)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                      disabled={children <= 0}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold"
                      aria-label="Decrease Children"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-base text-[#F3E5AB]">
                      {children}
                    </span>
                    <button
                      onClick={() => setChildren(prev => Math.min(8, prev + 1))}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                      aria-label="Increase Children"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B132B]/80 border border-white/10">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Infants (Under 2)</h4>
                    <p className="text-xs text-slate-400">Complimentary admission & stroller accommodation</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInfants(prev => Math.max(0, prev - 1))}
                      disabled={infants <= 0}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold"
                      aria-label="Decrease Infants"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-base text-[#F3E5AB]">
                      {infants}
                    </span>
                    <button
                      onClick={() => setInfants(prev => Math.min(4, prev + 1))}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                      aria-label="Increase Infants"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADD-ONS */}
          {currentStep === 4 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 4: Enhance Your Trip With Festive Add-ons
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Select optional luxury upgrades, private airport transfers, and VIP holiday activities
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADD_ONS.map((item) => {
                  const isChecked = selectedAddOnIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAddOn(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isChecked 
                          ? 'bg-[#1C2541] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-md' 
                          : 'bg-[#0B132B]/60 border-white/10 hover:border-white/30 hover:bg-[#1C2541]/40'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-900 border border-white/10 shrink-0 mt-0.5">
                        {renderAddOnIcon(item.iconName)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-xs font-bold text-[#F3E5AB] whitespace-nowrap">
                            +${item.price}
                            <span className="text-[10px] text-slate-400 font-normal">
                              {item.priceType === 'per_person' ? '/pers' : item.priceType === 'per_night' ? '/night' : ' flat'}
                            </span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="w-4 h-4 accent-[#D4AF37] shrink-0 mt-1 cursor-pointer"
                        aria-label={`Select ${item.name}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: TRAVELER DETAILS */}
          {currentStep === 5 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 5: Lead Traveler Details
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  We'll email your itinerary, QR code, and downloadable PDF ticket to this address
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                    Lead Traveler Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={travelerInfo.leadName}
                    onChange={(e) => {
                      setTravelerInfo({ ...travelerInfo, leadName: e.target.value });
                      if (errors.leadName) setErrors({ ...errors, leadName: '' });
                    }}
                    className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${
                      errors.leadName ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.leadName && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.leadName}
                    </p>
                  )}
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="eleanor@example.com"
                      value={travelerInfo.email}
                      onChange={(e) => {
                        setTravelerInfo({ ...travelerInfo, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={travelerInfo.phone}
                      onChange={(e) => {
                        setTravelerInfo({ ...travelerInfo, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={`w-full bg-[#0B132B] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                    Special Requests / Dietary / Accessibility (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Vegetarian meals, high floor hotel request, anniversary celebration"
                    value={travelerInfo.specialRequests}
                    onChange={(e) => setTravelerInfo({ ...travelerInfo, specialRequests: e.target.value })}
                    className="w-full bg-[#0B132B] border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                {/* Terms checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={travelerInfo.agreedToTerms}
                      onChange={(e) => {
                        setTravelerInfo({ ...travelerInfo, agreedToTerms: e.target.checked });
                        if (errors.terms) setErrors({ ...errors, terms: '' });
                      }}
                      className="w-4 h-4 accent-[#D4AF37] shrink-0 mt-0.5 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      I agree to the holiday package booking terms, free 24-hour cancellation policy, and guarantee that travelers comply with NYC theater & hotel guidelines.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.terms}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & CONFIRM */}
          {currentStep === 6 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 6: Review & Finalize Booking
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Double check your reservation details prior to confirmation
                </p>
              </div>

              {/* Demo Mode Notice Banner */}
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-amber-200 text-xs">
                <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-white block mb-0.5">
                    Demo Mode Notice:
                  </strong>
                  <span>
                    No real credit card or payment transaction is processed. You can safely confirm this booking or click "Auto-fill Demo Card" to test the flow and generate your verifiable PDF ticket.
                  </span>
                </div>
              </div>

              {/* Trip Summary Card */}
              <div className="bg-[#0B132B]/80 rounded-xl border border-white/10 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                      {selectedPackage.category}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-white">
                      {selectedPackage.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dates: <strong className="text-slate-200">{startDate}</strong> to <strong className="text-slate-200">{endDate}</strong> ({durationDays} Days / {durationDays - 1} Nights)
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    className="text-xs text-[#D4AF37] hover:underline whitespace-nowrap"
                  >
                    Change
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                      Travelers ({adults + children + infants} Total)
                    </span>
                    <p className="text-white">
                      {adults} Adult{adults > 1 ? 's' : ''}
                      {children > 0 && `, ${children} Child${children > 1 ? 'ren' : ''}`}
                      {infants > 0 && `, ${infants} Infant${infants > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                      Lead Traveler
                    </span>
                    <p className="text-white font-medium">{travelerInfo.leadName || 'Guest'}</p>
                    <p className="text-slate-400">{travelerInfo.email} · {travelerInfo.phone}</p>
                  </div>
                </div>

                {/* Add-ons List if any */}
                {selectedAddOnObjects.length > 0 && (
                  <div className="border-t border-white/10 pt-3">
                    <span className="text-slate-400 block mb-2 font-semibold uppercase tracking-wider text-[10px]">
                      Included Add-ons ({selectedAddOnObjects.length})
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      {selectedAddOnObjects.map(a => (
                        <div key={a.id} className="flex items-center justify-between">
                          <span>• {a.name}</span>
                          <span className="text-[#F3E5AB]">
                            +${a.priceType === 'per_person' ? a.price * (adults + children) : 
                               a.priceType === 'per_night' ? a.price * Math.max(1, durationDays - 1) : a.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Demo Payment Fields */}
              <div className="bg-[#0B132B]/80 rounded-xl border border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span>Demo Card Details (Simulated)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDemo}
                    className="text-xs text-[#D4AF37] hover:underline"
                  >
                    Auto-fill Demo Card
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-[#1C2541] border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#1C2541] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-[#1C2541] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">CVV Security Code</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-[#1C2541] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/20 text-slate-200 text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetDraft}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                title="Clear draft and start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Draft</span>
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#E5C158] hover:shadow-lg transition-all active:scale-95"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#E5C158] shadow-xl hover:shadow-[#D4AF37]/30 transition-all active:scale-95 animate-pulse"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Confirm Holiday Booking (${grandTotal})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Price Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-[#D4AF37]/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-serif font-bold text-white text-base">
                Reservation Summary
              </h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Draft Saved
              </span>
            </div>

            {/* Selected Package Snapshot */}
            <div className="flex gap-3 items-center">
              <img 
                src={selectedPackage.image} 
                alt={selectedPackage.name} 
                className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] block truncate">
                  {selectedPackage.category}
                </span>
                <h5 className="text-xs font-serif font-bold text-white truncate">
                  {selectedPackage.name}
                </h5>
                <span className="text-[11px] text-slate-300">
                  {selectedPackage.duration} · {startDate}
                </span>
              </div>
            </div>

            {/* Itemized Cost Breakdown */}
            <div className="space-y-2 text-xs border-t border-white/10 pt-3">
              <div className="flex justify-between text-slate-300">
                <span>{adults} Adult{adults > 1 ? 's' : ''} (${basePricePerPerson} ea)</span>
                <span className="font-medium">${adults * basePricePerPerson}</span>
              </div>

              {children > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>{children} Child{children > 1 ? 'ren' : ''} (25% off)</span>
                  <span className="font-medium">${children * childPricePerPerson}</span>
                </div>
              )}

              {infants > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>{infants} Infant{infants > 1 ? 's' : ''}</span>
                  <span className="font-medium">Free</span>
                </div>
              )}

              {addOnsTotal > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Add-ons ({selectedAddOnObjects.length})</span>
                  <span className="font-medium text-[#F3E5AB]">+${addOnsTotal}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Promo ({appliedPromo?.code})</span>
                  <span>-${discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>NYC Taxes & Tourism Fees (8.875%)</span>
                <span>${taxesAndFees}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. NYC2026)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="w-full bg-[#0B132B] border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-[#D4AF37]"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-[11px] text-red-400 mt-1">{promoError}</p>
              )}
              {appliedPromo && (
                <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                  ✓ {appliedPromo.description}
                </p>
              )}
            </div>

            {/* Grand Total */}
            <div className="border-t border-white/20 pt-4 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-300 block">
                  Total Investment
                </span>
                <span className="text-[10px] text-slate-400">All fees & taxes included</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif font-bold text-[#F3E5AB]">
                  ${grandTotal}
                </span>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant confirmation & official PDF ticket</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>Free cancellation up to 24 hours prior</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
