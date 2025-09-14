import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  role: 'tourist' | 'guide' | 'police' | 'hotel' | 'airport';
  email: string;
  password: string;
  // Role-specific fields
  tourist?: {
    name: string;
    passport_no: string;
    emergency_contact: string;
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
}

const userSchema = new Schema<IUser>({
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
  // Role-specific fields
  tourist: {
    name: String,
    passport_no: String,
    emergency_contact: String,
  },
  guide: {
    name: String,
    license_id: String,
    region_assigned: String,
  },
  police: {
    name: String,
    badge_id: String,
    station_location: String,
  },
  hotel: {
    hotel_name: String,
    registration_id: String,
    location: String,
    contact_number: String,
  },
  airport: {
    airport_name: String,
    iata_code: String,
    location: String,
    authority_contact: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for better performance
userSchema.index({ email: 1, role: 1 });
userSchema.index({ 'tourist.passport_no': 1 });
userSchema.index({ 'guide.license_id': 1 });
userSchema.index({ 'police.badge_id': 1 });
userSchema.index({ 'hotel.registration_id': 1 });
userSchema.index({ 'airport.iata_code': 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
