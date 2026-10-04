export interface ImageCredit {
  photographer: string;
  source: string;
  url: string;
}

export interface HotspotCoordinate {
  id: string;
  title: string;
  yaw: number; // in degrees (-180 to 180)
  pitch: number; // in degrees (-90 to 90)
  distance?: number;
}

export interface Package {
  id: string;
  name: string;
  tagline: string;
  category: 'Iconic Landmarks' | 'Festive Broadway' | 'Romantic Winter' | 'Family Holiday';
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  badge?: string;
  image: string;
  imageCredit: ImageCredit;
  hotspot: HotspotCoordinate;
  description: string;
  highlights: string[];
  includedAmenities: string[];
}

export interface AddOnItem {
  id: string;
  name: string;
  category: 'Hotels' | 'Shows' | 'Transport' | 'VIP Experiences';
  price: number;
  priceType: 'per_person' | 'per_booking' | 'per_night';
  description: string;
  iconName: string;
}

export interface TravelerInfo {
  leadName: string;
  email: string;
  phone: string;
  specialRequests: string;
  emergencyContact: string;
  agreedToTerms: boolean;
}

export interface BookingDraft {
  packageId: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  infants: number;
  selectedAddOns: string[];
  travelerInfo: TravelerInfo;
  promoCode: string;
  discountAmount: number;
  step: number; // 1 to 6
}

export interface ConfirmedBooking {
  id: string;
  createdAt: string;
  packageItem: Package;
  startDate: string;
  endDate: string;
  durationDays: number;
  adults: number;
  children: number;
  infants: number;
  selectedAddOns: {
    id: string;
    name: string;
    cost: number;
    description: string;
  }[];
  travelerInfo: TravelerInfo;
  basePrice: number;
  travelersMultiplierCost: number;
  addOnsTotal: number;
  promoCode?: string;
  discountAmount: number;
  taxesAndFees: number;
  grandTotal: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}
