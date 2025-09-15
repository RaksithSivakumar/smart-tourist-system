import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGuest extends Document {
  hotel: Types.ObjectId; // reference to User (role: hotel)
  tourist: Types.ObjectId; // reference to User (role: tourist)
  name: string;
  government_id: string; // id provided by hotel (could be passport/aadhaar/etc)
  room_type: string;
  rooms_required: number;
  address: string;
  phone_number: string;
  email: string;
  check_in: Date;
  check_out: Date;
  last_seen?: Date;
  created_at: Date;
}

const GuestSchema = new Schema<IGuest>({
  hotel: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tourist: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  government_id: { type: String, required: true },
  room_type: { type: String, required: true },
  rooms_required: { type: Number, required: true, min: 1, default: 1 },
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  check_in: { type: Date, required: true },
  check_out: { type: Date, required: true },
  last_seen: { type: Date },
  created_at: { type: Date, default: Date.now },
});

GuestSchema.index({ hotel: 1, check_in: -1 });
GuestSchema.index({ email: 1 });

export default mongoose.models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);


