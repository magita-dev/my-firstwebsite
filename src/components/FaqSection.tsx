import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Ticket, Calendar, Snowflake } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How does the 3D Times Square interactive panoramic tour work?',
    a: 'Our 3D hero uses WebGL and Three.js with a real equirectangular photograph of Times Square at night. You can click and drag to look 360° around the crossroads of the world, zoom in/out with your mouse wheel or gestures, and click the pulsating golden beacons to explore packages connected to Broadway, Central Park, and Rockefeller Center.',
    category: '3D Experience'
  },
  {
    q: 'What happens if there is severe winter weather in New York?',
    a: 'We understand that NYC winter snowstorms happen! Every holiday package includes our Flexible Weather Rescheduling Guarantee. If an outdoor activity or flight is affected by severe weather, our 24/7 concierge will reschedule your dates or substitute equivalent indoor VIP experiences with zero penalty.',
    category: 'Booking & Policies'
  },
  {
    q: 'How do I download and use my PDF holiday ticket?',
    a: 'Immediately upon completing your reservation, you can download your official high-resolution PDF e-ticket with one click. It includes your personalized booking reference ID, traveler names, dates, itemized inclusions, and a scannable QR code. Simply save it on your phone or print a paper copy to present at hotel check-in and venue box offices.',
    category: 'Tickets'
  },
  {
    q: 'Are Broadway show seats guaranteed together for families and couples?',
    a: 'Yes. All Broadway and Radio City tickets included in our holiday packages are seated consecutively in prime Center Orchestra or Front Mezzanine tiers. If you have special accessibility or seating requests, you can enter them in the booking flow.',
    category: 'Shows'
  },
  {
    q: 'Can I customize my package with additional nights or extra guests?',
    a: 'Yes! During Step 3 and Step 4 of the booking process, you can easily adjust guest counts (with a 25% discount for children under 12) and add luxury hotel upgrades, private SUV airport transfers, or Rockefeller VIP fast-track skate passes.',
    category: 'Customization'
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: 'Most bookings offer 100% free cancellation up to 24 hours prior to your scheduled arrival date. You can cancel or manage your reservations anytime under the "My Bookings" page.',
    category: 'Booking & Policies'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block mb-2">
          Help & Travel Insights
        </span>
        <h2 className="text-3xl font-serif font-bold text-white mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Everything you need to know about planning your holiday trip to New York City.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`rounded-xl border transition-all ${
                isOpen 
                  ? 'bg-[#1C2541]/80 border-[#D4AF37]/50 shadow-md' 
                  : 'bg-[#0B132B]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#D4AF37]">
                    0{index + 1}.
                  </span>
                  <h4 className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </h4>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#D4AF37] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
