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

    // Check if user has permission to view flights
    const { allowed, error: roleError } = requireRole(['airport'])(user);
    if (!allowed) {
      return NextResponse.json(
        { error: roleError || 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Mock flights data - in a real app, this would come from a database
    const flights = [
      {
        id: '1',
        flight_number: 'AA123',
        airline: 'American Airlines',
        destination: 'Los Angeles',
        departure_time: '2024-01-15T14:30:00Z',
        gate: 'A12',
        status: 'boarding',
        passengers: [
          {
            name: 'John Doe',
            passport_no: 'A1234567',
            seat: '12A',
            checked_in: true,
          },
          {
            name: 'Jane Smith',
            passport_no: 'B2345678',
            seat: '12B',
            checked_in: true,
          },
        ],
      },
      {
        id: '2',
        flight_number: 'UA456',
        airline: 'United Airlines',
        destination: 'Chicago',
        departure_time: '2024-01-15T16:45:00Z',
        gate: 'B8',
        status: 'delayed',
        passengers: [
          {
            name: 'Mike Johnson',
            passport_no: 'C3456789',
            seat: '8C',
            checked_in: false,
          },
        ],
      },
      {
        id: '3',
        flight_number: 'DL789',
        airline: 'Delta Airlines',
        destination: 'Miami',
        departure_time: '2024-01-15T18:20:00Z',
        gate: 'C15',
        status: 'on_time',
        passengers: [
          {
            name: 'Sarah Wilson',
            passport_no: 'D4567890',
            seat: '15F',
            checked_in: true,
          },
        ],
      },
    ];

    return NextResponse.json({
      flights,
      count: flights.length,
      airport: user.airport?.airport_name,
      iata_code: user.airport?.iata_code,
    });

  } catch (error) {
    console.error('Get flights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
