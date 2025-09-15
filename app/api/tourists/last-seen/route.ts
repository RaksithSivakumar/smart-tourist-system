import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';
import { authenticateUser, requireRole } from '@/lib/auth';

// Updates last_seen for all active guest records of the logging-out tourist
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { allowed, error: roleError } = requireRole(['tourist'])(user);
    if (!allowed) {
      return NextResponse.json({ error: roleError || 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();
    const now = new Date();
    // Update guest records where the tourist is this user and stay is ongoing or recent
    await Guest.updateMany({ tourist: user.id || user._id, check_out: { $gte: now } }, { $set: { last_seen: now } });

    return NextResponse.json({ ok: true, last_seen: now.toISOString() });
  } catch (err) {
    console.error('Update last_seen error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


