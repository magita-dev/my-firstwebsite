import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { fetchUserBookingsFromFirestore } from '../lib/firebase';
import { ConfirmedBooking } from '../types';
import {
  Calendar,
  Ticket,
  Clock,
  MapPin,
  Users,
  Download,
  Printer,
  Trash2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Database
} from 'lucide-react';

interface MyBookingsProps {
  onSelectBookingForTicket: (booking: ConfirmedBooking) => void;
  onNavigateToBooking: () => void;
  currentUser?: FirebaseUser | null;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  onSelectBookingForTicket,
  onNavigateToBooking,
  currentUser
}) => {
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);

  // Load from localStorage and Firestore
  const loadBookings = async () => {
    let localList: ConfirmedBooking[] = [];
    try {
      const dataStr = localStorage.getItem('nyc_holiday_my_bookings');
      if (dataStr) {
        localList = JSON.parse(dataStr);
      }
    } catch {}

    if (currentUser?.uid) {
      try {
        const firestoreList = await fetchUserBookingsFromFirestore(currentUser.uid);
        // Combine without duplicates
        const map = new Map<string, ConfirmedBooking>();
        localList.forEach(b => map.set(b.id, b));
        firestoreList.forEach(b => map.set(b.id, b));
        setBookings(Array.from(map.values()));
        return;
      } catch (e) {
        console.warn('Could not load from Firestore, using local cache', e);
      }
    }

    setBookings(localList);
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  // Cancel / Delete a test booking
  const handleCancelBooking = (id: string) => {
    if (window.confirm(`Are you sure you want to cancel booking ${id}? Free cancellation is guaranteed.`)) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      try {
        localStorage.setItem('nyc_holiday_my_bookings', JSON.stringify(updated));
      } catch {}
    }
  };

  // Add demo booking for quick test review
  const handleCreateSampleBooking = () => {
    const sample: ConfirmedBooking = {
      id: 'NYC-2026-ROC982',
      createdAt: new Date().toISOString(),
      packageItem: {
        id: 'rockefeller-christmas',
        name: 'Rockefeller Center Tree & Ice Skating Gala',
        tagline: 'The Quintessential NYC Holiday Tradition',
        category: 'Iconic Landmarks',
        price: 680,
        originalPrice: 850,
        duration: '5 Days / 4 Nights',
        rating: 4.98,
        reviewCount: 242,
        featured: true,
        image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80',
        imageCredit: {
          photographer: 'Michael Discenza',
          source: 'Unsplash',
          url: 'https://unsplash.com/photos/MxfcoxycH_Y'
        },
        hotspot: {
          id: 'hotspot-rockefeller',
          title: 'Rockefeller Center & 5th Ave',
          yaw: 42,
          pitch: 5,
          distance: 450
        },
        description: 'Glide across the ice under the world-famous Rockefeller Christmas Tree with VIP fast-track access.',
        highlights: [
          'VIP Ice Rink access + heated warming tent with refreshments',
          'Top of the Rock observation deck priority sunset ticket',
          'Fifth Avenue holiday window walking tour',
          'Gourmet hot chocolate tasting'
        ],
        includedAmenities: [
          'Skate rental & lockers included',
          'Priority elevator access at 30 Rock',
          'Official Rockefeller holiday ornament'
        ]
      },
      startDate: '2026-12-22',
      endDate: '2026-12-26',
      durationDays: 5,
      adults: 2,
      children: 1,
      infants: 0,
      selectedAddOns: [
        {
          id: 'luxury-hotel-upgrade',
          name: 'The Plaza Hotel Fifth Avenue Upgrade',
          cost: 1360,
          description: 'Grand Deluxe Room with daily English breakfast'
        },
        {
          id: 'rockefeller-skate-pass',
          name: 'Rockefeller Center VIP Fast-Track Skate Pass',
          cost: 255,
          description: 'Heated chalets and hot cocoa bar'
        }
      ],
      travelerInfo: {
        leadName: 'Eleanor & Charles Vance',
        email: 'vance.family@example.com',
        phone: '+1 (212) 555-0188',
        specialRequests: 'High floor park view room requested for wedding anniversary',
        emergencyContact: 'Robert Vance (+1 555 982 1100)',
        agreedToTerms: true
      },
      basePrice: 680,
      travelersMultiplierCost: 1870,
      addOnsTotal: 1615,
      promoCode: 'NYC2026',
      discountAmount: 522,
      taxesAndFees: 263,
      grandTotal: 3226,
      status: 'Confirmed'
    };

    const updated = [sample, ...bookings];
    setBookings(updated);
    try {
      localStorage.setItem('nyc_holiday_my_bookings', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block mb-1">
            Trip Management
          </span>
          <h2 className="text-3xl font-serif font-bold text-white">
            My Holiday Bookings
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Access your confirmed e-tickets, download official PDF passes, or add trips to your calendar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToBooking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#0B132B] bg-[#D4AF37] hover:bg-[#E5C158] transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-[#D4AF37]/50 transition-all shadow-xl flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
            >
              {/* Photo & Main Details */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                <img
                  src={booking.packageItem.image}
                  alt={booking.packageItem.name}
                  className="w-full sm:w-36 h-28 rounded-xl object-cover border border-white/10 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                      {booking.packageItem.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {booking.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {booking.id}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                    {booking.packageItem.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {booking.startDate} – {booking.endDate} ({booking.durationDays} Days)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {booking.adults + booking.children} Guest{booking.adults + booking.children > 1 ? 's' : ''} ({booking.travelerInfo.leadName})
                    </span>
                  </div>

                  {booking.selectedAddOns.length > 0 && (
                    <p className="text-[11px] text-slate-400">
                      Add-ons: {booking.selectedAddOns.map(a => a.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                    Total Investment
                  </span>
                  <span className="text-xl font-serif font-bold text-[#F3E5AB]">
                    ${booking.grandTotal}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectBookingForTicket(booking)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] hover:shadow-lg transition-all active:scale-95"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>View E-Ticket & PDF</span>
                  </button>

                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Cancel booking"
                    aria-label="Cancel booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 border border-white/10">
          <div className="w-16 h-16 rounded-full bg-[#1C2541] border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37]">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">
            No Active Bookings Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You haven't reserved any holiday packages yet. Explore our 3D Times Square panoramic showcase or create your dream holiday package now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToBooking}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-[#0B132B] bg-[#D4AF37] hover:bg-[#E5C158] transition-colors shadow-md w-full sm:w-auto justify-center"
            >
              <span>Explore Packages & Book</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleCreateSampleBooking}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Load Sample VIP Booking</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
