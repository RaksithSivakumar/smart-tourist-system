import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import connectDB from './mongodb';
import User from './models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

export async function authenticateUser(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined);
    
    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { user: null, error: 'Invalid token' };
    }

    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { 
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        ...user.toObject()
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export function requireRole(allowedRoles: string[]) {
  return (user: any) => {
    if (!user) {
      return { allowed: false, error: 'Authentication required' };
    }
    
    if (!allowedRoles.includes(user.role)) {
      return { allowed: false, error: 'Insufficient permissions' };
    }
    
    return { allowed: true, error: null };
  };
}
