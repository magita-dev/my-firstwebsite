import { AddOnItem } from '../types';

export const ADD_ONS: AddOnItem[] = [
  {
    id: 'luxury-hotel-upgrade',
    name: 'The Plaza Hotel Fifth Avenue Upgrade',
    category: 'Hotels',
    price: 340,
    priceType: 'per_night',
    description: 'Upgrade your stay to a Grand Deluxe Room at NYC’s most iconic holiday palace with daily English breakfast and champagne check-in.',
    iconName: 'Building'
  },
  {
    id: 'broadway-premium-seats',
    name: 'VIP Front Orchestra Broadway Seats',
    category: 'Shows',
    price: 185,
    priceType: 'per_person',
    description: 'Front center orchestra seating for premier holiday productions (Radio City Rockettes, Wicked, or The Lion King) with commemorative program.',
    iconName: 'Ticket'
  },
  {
    id: 'airport-suv-chauffeur',
    name: 'Private Luxury SUV Airport Chauffeur',
    category: 'Transport',
    price: 135,
    priceType: 'per_booking',
    description: 'Round-trip private luxury Suburban or Escalade transfer between JFK, LGA, or EWR and your Manhattan hotel with luggage assistance.',
    iconName: 'Car'
  },
  {
    id: 'rockefeller-skate-pass',
    name: 'Rockefeller Center VIP Fast-Track Skate Pass',
    category: 'VIP Experiences',
    price: 85,
    priceType: 'per_person',
    description: 'Skip the holiday ice rink lines with heated VIP chalets access, complimentary skate rentals, and hot cocoa bar with fresh marshmallows.',
    iconName: 'Sparkles'
  },
  {
    id: 'central-park-carriage',
    name: 'Private Central Park Holiday Carriage Ride',
    category: 'VIP Experiences',
    price: 160,
    priceType: 'per_booking',
    description: 'A 50-minute private horse-drawn carriage ride through snow-dusted Central Park paths with plush fleece blankets and warm spiced apple cider.',
    iconName: 'Heart'
  },
  {
    id: 'gourmet-holiday-dinner',
    name: 'Fine Dining Holiday Tasting Menu',
    category: 'VIP Experiences',
    price: 195,
    priceType: 'per_person',
    description: 'Pre-set 4-course seasonal chef tasting dinner with sommelier reserve wine pairing at celebrated Manhattan restaurants like Gramercy Tavern.',
    iconName: 'Utensils'
  }
];

export const VALID_PROMO_CODES: Record<string, { discountPercent?: number; discountFlat?: number; description: string }> = {
  'NYC2026': { discountPercent: 15, description: '15% Off Winter Holiday Special' },
  'HOLIDAY25': { discountFlat: 100, description: '$100 Off Any Booking over $500' },
  'FESTIVE50': { discountFlat: 50, description: '$50 Instant Holiday Savings' }
};
