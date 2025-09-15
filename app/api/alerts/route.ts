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

    // Check if user has permission to view alerts
    const { allowed, error: roleError } = requireRole(['police', 'guide'])(user);
    if (!allowed) {
      return NextResponse.json(
        { error: roleError || 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Mock alerts data - in a real app, this would come from a database
    const alerts = [
      {
        id: '1',
        type: 'SOS',
        location: 'Times Square, New York',
        tourist: 'John Doe',
        timestamp: new Date().toISOString(),
        status: 'active',
        priority: 'high',
      },
      {
        id: '2',
        type: 'Medical Emergency',
        location: 'Central Park, New York',
        tourist: 'Jane Smith',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'resolved',
        priority: 'high',
      },
      {
        id: '3',
        type: 'Lost Tourist',
        location: 'Brooklyn Bridge, New York',
        tourist: 'Mike Johnson',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'investigating',
        priority: 'medium',
      },
    ];

    return NextResponse.json({
      alerts,
      count: alerts.length,
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
