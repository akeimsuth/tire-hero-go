
// Core data models matching Strapi collections
export interface User {
  id: string;
  email: string;
  role: 'customer' | 'provider';
  profilePhoto?: string;
  documentId: string;
  business: {
    businessName: string;
    id: Provider;
  };
  rating: number;
  totalJobs: number;
  customer:{
    fullName: string;
    documentId: string;
  }
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  role: 'customer';
  fullName: string;
  phone: string;
  defaultPaymentMethod?: string;
  savedLocations: Location[];
  walletBalance: number;
}

export interface Provider extends User {
  role: 'provider';
  businessName: string;
  serviceArea: {
    lat: number;
    lng: number;
    radius: number;
  };
  serviceTypes: ServiceType[];
  hourlyRate: number;
  vehicleSpecs: string;
  yearsExperience: number;
  languages: string[];
  availability: AvailabilitySchedule;
  walletBalance: number;
  isApproved: boolean;
  rating: number;
  totalJobs: number;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customer?: Customer;
  tireSize: string;
  serviceType: ServiceType;
  location: Location;
  photos: string[];
  notes: string;
  urgency: 'emergency' | 'urgent' | 'standard' | 'scheduled';
  tireStatus: string;//RequestStatus;
  budget?: number;
  createdAt: string;
  bids: Bid[];
  accepted_bid?: Bid;
}

export interface Bid {
  id: string;
  requestId: string;
  providerId: string;
  provider?: Provider;
  amount: number;
  estimatedArrival: number;
  notes: string;
  createdAt: string;
  bidStatus: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface Location {
  id?: string;
  address: string;
  lat: number;
  lng: number;
  name?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'top-up' | 'payout' | 'fee' | 'tip' | 'refund' | 'payment';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Rating {
  id: string;
  customer_id: string;
  provider_id: string;
  request_id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MyFile {
  id: string;
}

export type ServiceType = 'flat-repair' | 'tire-change' | 'rotation' | 'balancing' | 'valve-replacement' | 'tire-sales';
//export type RequestStatus = 'requested' | 'bids-open' | 'offer-pending' | 'accepted' | 'en-route' | 'on-site' | 'in-service' | 'completed' | 'cancelled';

export interface AvailabilitySchedule {
  monday: { start: string; end: string; available: boolean };
  tuesday: { start: string; end: string; available: boolean };
  wednesday: { start: string; end: string; available: boolean };
  thursday: { start: string; end: string; available: boolean };
  friday: { start: string; end: string; available: boolean };
  saturday: { start: string; end: string; available: boolean };
  sunday: { start: string; end: string; available: boolean };
}
