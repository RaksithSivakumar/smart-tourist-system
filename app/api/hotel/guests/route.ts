import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Guest from '@/lib/models/Guest';
import { authenticateUser, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { allowed, error: roleError } = requireRole(['hotel'])(user);
    if (!allowed) {
      return NextResponse.json({ error: roleError || 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const guests = await Guest.find({ hotel: user.id || user._id })
      .sort({ check_in: -1 })
      .lean();

    return NextResponse.json({ guests });
  } catch (err) {
    console.error('Guests GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { allowed, error: roleError } = requireRole(['hotel'])(user);
    if (!allowed) {
      return NextResponse.json({ error: roleError || 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      tourist_id, // string: must be User _id (ObjectId)
      name,
      id: government_id,
      room_type,
      rooms_required,
      address,
      phone_number,
      email,
      check_in,
      check_out,
    } = body || {};

    if (!name || !government_id || !room_type || !rooms_required || !address || !phone_number || !email || !check_in || !check_out) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (typeof rooms_required !== 'number' || rooms_required < 1) {
      return NextResponse.json({ error: 'rooms_required must be a positive number' }, { status: 400 });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
    }

    await connectDB();

    // Validate tourist existence: must be a valid ObjectId string referencing a tourist
    if (!tourist_id) {
      return NextResponse.json({ error: 'tourist_id is required and must be a valid ObjectId' }, { status: 400 });
    }
    let touristDoc = null as any;
    try {
      touristDoc = await User.findOne({ _id: tourist_id, role: 'tourist' });
    } catch {
      touristDoc = null;
    }

    if (!touristDoc) {
      return NextResponse.json({ error: 'Tourist not found in the system' }, { status: 404 });
    }

    const created = await Guest.create({
      hotel: user.id || user._id,
      tourist: touristDoc._id,
      name,
      government_id,
      room_type,
      rooms_required,
      address,
      phone_number,
      email: String(email).toLowerCase(),
      check_in: checkInDate,
      check_out: checkOutDate,
    });

    return NextResponse.json({ guest: created }, { status: 201 });
  } catch (err) {
    console.error('Guests POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


