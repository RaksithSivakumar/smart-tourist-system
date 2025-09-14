import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, requireRole } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to view tourists
    const { allowed, error: roleError } = requireRole(['guide', 'police'])(user);
    if (!allowed) {
      return NextResponse.json(
        { error: roleError || 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get tourists based on role
    let query: any = { role: 'tourist' };
    
    if (user.role === 'guide') {
      // Guides can only see tourists in their assigned region
      query['tourist.region_assigned'] = user.guide?.region_assigned;
    }
    // Police can see all tourists

    const tourists = await User.find(query).select('-password');

    return NextResponse.json({
      tourists,
      count: tourists.length,
    });

  } catch (error) {
    console.error('Get tourists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
