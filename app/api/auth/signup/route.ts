import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, email, password, ...roleSpecificData } = body;

    console.log('Received signup data:', { role, email, roleSpecificData });

    // Validate required fields
    if (!role || !email || !password) {
      return NextResponse.json(
        { error: 'Role, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate role-specific fields
    const validationError = validateRoleSpecificFields(role, roleSpecificData);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object with proper structure
    const userData: any = {
      role,
      email: email.toLowerCase(),
      password: hashedPassword,
      created_at: new Date(),
    };

    // Add role-specific data as nested object
    userData[role] = roleSpecificData;

    console.log('User data to save:', userData);

    // Create user
    const user = new User(userData);
    const savedUser = await user.save();
    
    console.log('Saved user:', savedUser);

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateRoleSpecificFields(role: string, data: any): string | null {
  switch (role) {
    case 'tourist':
      if (!data.name || !data.passport_no || !data.emergency_contact) {
        return 'Tourist requires: name, passport_no, emergency_contact';
      }
      break;
    case 'guide':
      if (!data.name || !data.license_id || !data.region_assigned) {
        return 'Guide requires: name, license_id, region_assigned';
      }
      break;
    case 'police':
      if (!data.name || !data.badge_id || !data.station_location) {
        return 'Police requires: name, badge_id, station_location';
      }
      break;
    case 'hotel':
      if (!data.hotel_name || !data.registration_id || !data.location || !data.contact_number) {
        return 'Hotel requires: hotel_name, registration_id, location, contact_number';
      }
      break;
    case 'airport':
      if (!data.airport_name || !data.iata_code || !data.location || !data.authority_contact) {
        return 'Airport requires: airport_name, iata_code, location, authority_contact';
      }
      break;
    default:
      return 'Invalid role';
  }
  return null;
}
