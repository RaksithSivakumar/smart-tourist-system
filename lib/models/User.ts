import mongoose, { Document, Schema, Model } from 'mongoose';

// Location interface
export interface ILocation {
  lat: number;
  lng: number;
  city: string;
  updatedAt: Date;
}

// Interface for IUser
export interface IUser extends Document {
  role: 'tourist' | 'guide' | 'police' | 'hotel' | 'airport';
  email: string;
  password: string;
  // Updated role-specific fields
  tourist?: {
    name: string;
    passport_no: string;
    emergency_contact: string;
    lastLocation?: ILocation;
    locationHistory: ILocation[];
  };
  guide?: {
    name: string;
    license_id: string;
    region_assigned: string;
  };
  police?: {
    name: string;
    badge_id: string;
    station_location: string;
  };
  hotel?: {
    hotel_name: string;
    registration_id: string;
    location: string;
    contact_number: string;
  };
  airport?: {
    airport_name: string;
    iata_code: string;
    location: string;
    authority_contact: string;
  };
  created_at: Date;
  updated_at: Date;
}

// Location Schema
const LocationSchema = new Schema<ILocation>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  city: { type: String, required: true },
  updatedAt: { type: Date, required: true },
});

// User Schema
const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ['tourist', 'guide', 'police', 'hotel', 'airport'],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    tourist: {
      name: { type: String },
      passport_no: { type: String },
      emergency_contact: { type: String },
      lastLocation: LocationSchema,
      locationHistory: { type: [LocationSchema], default: [] },
    },
    guide: {
      name: { type: String },
      license_id: { type: String },
      region_assigned: { type: String },
    },
    police: {
      name: { type: String },
      badge_id: { type: String },
      station_location: { type: String },
    },
    hotel: {
      hotel_name: { type: String },
      registration_id: { type: String },
      location: { type: String },
      contact_number: { type: String },
    },
    airport: {
      airport_name: { type: String },
      iata_code: { type: String },
      location: { type: String },
      authority_contact: { type: String },
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1, role: 1 });
userSchema.index({ 'tourist.passport_no': 1 });
userSchema.index({ 'guide.license_id': 1 });
userSchema.index({ 'police.badge_id': 1 });
userSchema.index({ 'hotel.registration_id': 1 });
userSchema.index({ 'airport.iata_code': 1 });

// Export model
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
