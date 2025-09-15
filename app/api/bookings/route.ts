import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to view bookings
    const { allowed, error: roleError } = requireRole(['hotel'])(user);
    if (!allowed) {
      return NextResponse.json(
        { error: roleError || 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Mock bookings data - in a real app, this would come from a database
    const bookings = [
      {
        id: '1',
        guest_name: 'John Doe',
        passport_no: 'A1234567',
        check_in: '2024-01-15',
        check_out: '2024-01-18',
        room_number: '101',
        status: 'checked_in',
        emergency_contact: '+1-555-0123',
      },
      {
        id: '2',
        guest_name: 'Jane Smith',
        passport_no: 'B2345678',
        check_in: '2024-01-16',
        check_out: '2024-01-20',
        room_number: '205',
        status: 'reserved',
        emergency_contact: '+1-555-0124',
      },
      {
        id: '3',
        guest_name: 'Mike Johnson',
        passport_no: 'C3456789',
        check_in: '2024-01-14',
        check_out: '2024-01-17',
        room_number: '312',
        status: 'checked_out',
        emergency_contact: '+1-555-0125',
      },
    ];

    return NextResponse.json({
      bookings,
      count: bookings.length,
      hotel: user.hotel?.hotel_name,
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
