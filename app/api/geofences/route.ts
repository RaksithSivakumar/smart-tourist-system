// app/api/geofences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define the Geofence schema
const GeofenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  note: { type: String },
  geometry: {
    type: { 
      type: String, 
      enum: ['Polygon'], 
      required: true 
    },
    coordinates: { 
      type: [[[Number]]],
      required: true 
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create index for geospatial queries
GeofenceSchema.index({ geometry: '2dsphere' });

const Geofence = mongoose.models.Geofence || mongoose.model('Geofence', GeofenceSchema, 'geofences');

// Helper function to extract token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Simple token validation (replace with your actual validation logic)
function validateToken(token: string | null): boolean {
  if (!token) return false;
  
  // In a real application, you would verify the JWT token here
  // For now, we'll allow requests without token for development
  // Replace this with your actual JWT verification logic
  try {
    // This is a placeholder - implement your actual JWT verification
    return token.length > 10; // Simple check for demo purposes
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request);
    
    // For development, we'll allow requests without authentication
    // In production, you should enable this check
    // if (!validateToken(token)) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    await connectDB();

    // Fetch all geofences
    const geofences = await Geofence.find({}).select('-__v');
    
    // Transform the data to match the expected frontend format
    const transformedGeofences = geofences.map(geofence => ({
      _id: geofence._id.toString(),
      name: geofence.name,
      note: geofence.note,
      geometry: {
        type: geofence.geometry.type,
        coordinates: geofence.geometry.coordinates
      }
    }));

    return NextResponse.json({
      geofences: transformedGeofences,
      count: transformedGeofences.length,
    });

  } catch (error) {
    console.error('Get geofences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}