// types.ts
export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum TripStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
}

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
  ratings?: number[];
}

export interface Message {
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface Passenger {
  id: string;
  name: string;
  profilePictureUrl: string;
}

export interface Trip {
  id: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: TripStatus;
  fare: number;
  isShared: boolean;
  passengers?: Passenger[];
  paymentMethod: PaymentMethod;
  createdAt: Date;
  rating?: number;
  messages?: Message[];
  driverLocation?: Location;
}
