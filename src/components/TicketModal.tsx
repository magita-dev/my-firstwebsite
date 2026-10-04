import React, { useEffect, useState, useRef } from 'react';
import { ConfirmedBooking } from '../types';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import {
  Download,
  Printer,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  Share2,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  HelpCircle,
  QrCode
} from 'lucide-react';

interface TicketModalProps {
  booking: ConfirmedBooking | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!booking) return;

    // Generate real scannable QR Code
    const qrData = JSON.stringify({
      bookingId: booking.id,
      lead: booking.travelerInfo.leadName,
      pkg: booking.packageItem.name,
      dates: `${booking.startDate} to ${booking.endDate}`,
      guests: booking.adults + booking.children,
      total: `$${booking.grandTotal}`
    });

    QRCode.toDataURL(qrData, {
      width: 250,
      margin: 1,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(() => {});
  }, [booking]);

  if (!booking) return null;

  // 1. Download PDF Ticket using jsPDF + QR Code
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Deep Navy Header Banner
      doc.setFillColor(11, 19, 43); // #0B132B
      doc.rect(0, 0, pageWidth, 42, 'F');

      // Gold Accent Line
      doc.setFillColor(212, 175, 55); // #D4AF37
      doc.rect(0, 42, pageWidth, 2.5, 'F');

      // Title & Holiday Branding
      doc.setTextColor(243, 229, 171); // #F3E5AB
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('HOLIDAY IN NEW YORK', 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('OFFICIAL E-TICKET & TRAVEL VOUCHER', 14, 26);

      doc.setFontSize(8);
      doc.setTextColor(200, 210, 230);
      doc.text('Valid across Manhattan Hotels, Broadway Box Offices & Harbor Cruises', 14, 34);

      // Reference Box (Top Right)
      doc.setFillColor(28, 37, 65);
      doc.roundedRect(pageWidth - 68, 8, 56, 26, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(212, 175, 55);
      doc.text('BOOKING REFERENCE', pageWidth - 64, 15);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(booking.id, pageWidth - 64, 23);
      doc.setFontSize(8);
      doc.setTextColor(160, 230, 180);
      doc.text('STATUS: CONFIRMED', pageWidth - 64, 30);

      // Traveler Info Section
      let curY = 54;
      doc.setTextColor(11, 19, 43);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('1. Lead Traveler & Party Composition', 14, curY);

      curY += 6;
      doc.setDrawColor(230, 230, 230);
      doc.line(14, curY, pageWidth - 14, curY);

      curY += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text('Lead Traveler:', 14, curY);
      doc.setFont('helvetica', 'normal');
      doc.text(booking.travelerInfo.leadName, 48, curY);

      doc.setFont('helvetica', 'bold');
      doc.text('Email Address:', 110, curY);
      doc.setFont('helvetica', 'normal');
      doc.text(booking.travelerInfo.email, 142, curY);

      curY += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Phone Number:', 14, curY);
      doc.setFont('helvetica', 'normal');
      doc.text(booking.travelerInfo.phone, 48, curY);

      doc.setFont('helvetica', 'bold');
      doc.text('Party Size:', 110, curY);
      doc.setFont('helvetica', 'normal');
      const partyText = `${booking.adults} Adult(s)${booking.children ? `, ${booking.children} Child(ren)` : ''}${booking.infants ? `, ${booking.infants} Infant(s)` : ''}`;
      doc.text(partyText, 142, curY);

      // Package Details Section
      curY += 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(11, 19, 43);
      doc.text('2. Holiday Package & Itinerary Dates', 14, curY);

      curY += 6;
      doc.line(14, curY, pageWidth - 14, curY);

      curY += 8;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, curY - 3, pageWidth - 28, 30, 2, 2, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 19, 43);
      doc.text(booking.packageItem.name, 18, curY + 4);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text(`Category: ${booking.packageItem.category}  |  Duration: ${booking.packageItem.duration}`, 18, curY + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Arrival: ${booking.startDate}`, 18, curY + 18);
      doc.text(`Departure: ${booking.endDate}`, 80, curY + 18);
      doc.text('Check-in: 3:00 PM  |  Check-out: 11:00 AM', 140, curY + 18);

      // Included Add-ons Section
      curY += 38;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(11, 19, 43);
      doc.text('3. Selected Experiences & Inclusions', 14, curY);

      curY += 6;
      doc.line(14, curY, pageWidth - 14, curY);

      curY += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);

      // Package highlights
      booking.packageItem.highlights.slice(0, 3).forEach(hl => {
        doc.text(`• ${hl}`, 16, curY);
        curY += 5;
      });

      // Custom add-ons
      if (booking.selectedAddOns.length > 0) {
        booking.selectedAddOns.forEach(a => {
          doc.text(`• [ADD-ON] ${a.name} (Included: $${a.cost})`, 16, curY);
          curY += 5;
        });
      }

      // Billing Summary & QR Code
      curY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(11, 19, 43);
      doc.text('4. Payment Summary & Check-In QR Pass', 14, curY);

      curY += 6;
      doc.line(14, curY, pageWidth - 14, curY);

      curY += 8;
      // Price breakdown box (Left)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      doc.text(`Base Package (${booking.adults + booking.children} guests):`, 14, curY);
      doc.text(`$${booking.travelersMultiplierCost}`, 85, curY, { align: 'right' });

      curY += 5;
      doc.text(`Add-ons & Upgrades:`, 14, curY);
      doc.text(`$${booking.addOnsTotal}`, 85, curY, { align: 'right' });

      if (booking.discountAmount > 0) {
        curY += 5;
        doc.setTextColor(16, 120, 60);
        doc.text(`Holiday Promotion (${booking.promoCode}):`, 14, curY);
        doc.text(`-$${booking.discountAmount}`, 85, curY, { align: 'right' });
        doc.setTextColor(70, 70, 70);
      }

      curY += 5;
      doc.text(`NYC Taxes & Tourism Surcharges (8.875%):`, 14, curY);
      doc.text(`$${booking.taxesAndFees}`, 85, curY, { align: 'right' });

      curY += 7;
      doc.setFillColor(212, 175, 55);
      doc.rect(14, curY - 4, 75, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(11, 19, 43);
      doc.text('TOTAL PAID:', 18, curY + 1.5);
      doc.text(`$${booking.grandTotal} USD`, 85, curY + 1.5, { align: 'right' });

      // Embed QR Code on Right
      if (qrCodeUrl) {
        doc.addImage(qrCodeUrl, 'PNG', 125, curY - 26, 42, 42);
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text('Scan for instant concierge & door check-in', 146, curY + 20, { align: 'center' });
      }

      // Footer Instructions & Concierge Support
      const footerY = 265;
      doc.setFillColor(245, 247, 250);
      doc.rect(0, footerY, pageWidth, 32, 'F');
      doc.setDrawColor(212, 175, 55);
      doc.line(0, footerY, pageWidth, footerY);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(11, 19, 43);
      doc.text('24/7 HOLIDAY CONCIERGE & EMERGENCY ASSISTANCE:', 14, footerY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Phone: +1 (212) 555-0199  |  Email: concierge@holidayinnewyork.com  |  Location: 350 Fifth Ave, NYC', 14, footerY + 13);
      doc.text('Present either this printed voucher or digital QR code on your mobile device upon arrival at each venue.', 14, footerY + 19);
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text('© 2026 Holiday in New York. All rights reserved. Non-transferable ticket subject to terms of service.', 14, footerY + 25);

      doc.save(`NYC_Holiday_Ticket_${booking.id}.pdf`);
    } catch (e) {
      console.error('PDF generation error', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Add to Calendar (.ics format download)
  const handleAddToCalendar = () => {
    // Format dates to YYYYMMDD
    const startCompact = booking.startDate.replace(/-/g, '');
    const endCompact = booking.endDate.replace(/-/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Holiday in New York//NYC Holiday Travel//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${booking.id}@holidayinnewyork.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${startCompact}`,
      `DTEND;VALUE=DATE:${endCompact}`,
      `SUMMARY:Holiday in New York - ${booking.packageItem.name}`,
      `DESCRIPTION:Booking Reference: ${booking.id}\\nLead Traveler: ${booking.travelerInfo.leadName}\\nPackage: ${booking.packageItem.name}\\nDuration: ${booking.durationDays} Days\\nTotal Investment: $${booking.grandTotal}\\n\\nConcierge Support: +1 (212) 555-0199`,
      'LOCATION:Times Square & Manhattan, New York, NY 10036',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `NYC_Holiday_Trip_${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Print Ticket
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="relative w-full max-w-2xl bg-[#0B132B] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] border-b border-[#D4AF37]/30 p-5 sm:p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                Official Holiday E-Ticket
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Reservation Confirmed!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Booking Reference: <strong className="text-[#F3E5AB] font-mono text-sm">{booking.id}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Bar */}
        <div className="bg-[#1C2541]/80 px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold">Active Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B132B] font-bold shadow transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF Ticket'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Add to Calendar */}
            <button
              onClick={handleAddToCalendar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>.ICS Calendar</span>
            </button>
          </div>
        </div>

        {/* Printable Ticket Voucher Body */}
        <div ref={printRef} className="p-6 space-y-6 text-slate-200 text-xs print-area">
          
          {/* Real Photo Banner */}
          <div className="relative h-44 rounded-xl overflow-hidden border border-white/10">
            <img 
              src={booking.packageItem.image} 
              alt={booking.packageItem.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">
                  {booking.packageItem.category}
                </span>
                <h4 className="text-lg font-serif font-bold text-white leading-tight">
                  {booking.packageItem.name}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {booking.durationDays} Days / {booking.durationDays - 1} Nights in Manhattan
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-300 block">Total Investment</span>
                <span className="text-xl font-serif font-bold text-[#F3E5AB]">
                  ${booking.grandTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Key Info Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#1C2541]/50 border border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Lead Guest
              </span>
              <p className="text-sm font-bold text-white mt-0.5">
                {booking.travelerInfo.leadName}
              </p>
              <p className="text-[11px] text-slate-300">
                {booking.adults + booking.children} Guest{booking.adults + booking.children > 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Arrival / Departure
              </span>
              <p className="text-sm font-bold text-[#F3E5AB] mt-0.5">
                {booking.startDate}
              </p>
              <p className="text-[11px] text-slate-300">
                thru {booking.endDate}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Check-in Pass
              </span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Verified & Paid
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {booking.id}
              </p>
            </div>
          </div>

          {/* QR Code and Check-in Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#0B132B]/90 border border-[#D4AF37]/30">
            {/* Scannable QR code */}
            <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Booking QR Code" className="w-28 h-28" />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center bg-slate-100 text-slate-600">
                  <QrCode className="w-10 h-10 animate-spin" />
                </div>
              )}
            </div>

            {/* Verification instructions */}
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Instant Mobile & Gate Check-In</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan this QR code at your hotel reception, Broadway theater box office, and harbor cruise boarding gate for priority admission. No paper printout required.
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                <span>Confirmation sent to: </span>
                <strong className="text-white">{booking.travelerInfo.email}</strong>
              </div>
            </div>
          </div>

          {/* Included Features & Add-ons Summary */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <h5 className="font-semibold text-white uppercase text-[11px] tracking-wider">
              Included Package Amenities & Add-ons
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {booking.packageItem.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
              {booking.selectedAddOns.map((a) => (
                <div key={a.id} className="flex items-start gap-1.5 text-[#F3E5AB]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong>[Add-on]</strong> {a.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 24/7 Concierge Footer */}
          <div className="border-t border-white/10 pt-3 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>24/7 Holiday Concierge: <strong>+1 (212) 555-0199</strong></span>
            <span>350 Fifth Ave, Manhattan, New York 10118</span>
          </div>

        </div>

      </div>
    </div>
  );
};
