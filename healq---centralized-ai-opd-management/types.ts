export enum UserRole {
  PATIENT = 'PATIENT',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN'
}

export interface Slot {
  id: string;
  timeRange: string; // e.g., "09:00 AM - 10:00 AM"
  bookedCount: number;
  maxCapacity: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: 'Available' | 'Away' | 'On Leave';
  currentRoom: string;
  averageConsultationTime: number; // in minutes
  currentQueue: number; // number of patients waiting
  currentToken: number;
  slots: Slot[];
  statusMessage?: string; // e.g., "Doctor is late due to emergency"
  delayMinutes?: number; // Estimated delay in minutes
}

export interface Department {
  id: string;
  name: string;
  doctors: Doctor[];
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private';
  state: string;
  location: string;
  distance?: number;
  departments: Department[];
  totalWaitingCount: number;
  coordinates?: { lat: number; lng: number };
  facilities: string[];
  opdTimings: string;
  imageUrl?: string;
  bedAvailability: {
    total: number;
    available: number;
  };
}

export interface Token {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone?: string; // Added for SMS support
  hospitalId: string;
  hospitalName: string;
  departmentName: string;
  doctorName: string;
  status: 'Waiting' | 'In-Progress' | 'Completed' | 'Cancelled';
  bookedAt: string;
  estimatedTime: string;
  slotTime?: string;
  originalEstimatedTime?: string;
}

export interface Ambulance {
  id: string;
  regNo: string;
  type: 'Basic' | 'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)' | 'Cardiac';
  status: 'Available' | 'On Call' | 'Offline';
  hospitalId: string;
  hospitalName: string;
  driverName: string;
  driverPhone: string;
  distance: number; // in km
}

export interface AmbulanceRequest {
  id: string;
  ambulanceId: string;
  patientName: string;
  patientPhone: string;
  pickupLocation: string;
  status: 'Requested' | 'En-route' | 'Arrived' | 'Completed';
  requestedAt: string;
  estimatedArrival: number; // in minutes
}

export interface PredictionResult {
  estimatedWaitMinutes: number;
  isHighCrowd: boolean;
  advice: string;
}