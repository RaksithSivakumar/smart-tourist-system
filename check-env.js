// Check environment variables
console.log('Environment Variables Check:');
console.log('MONGODB_URL:', process.env.MONGODB_URL || 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'NOT SET');
console.log('MONGO_DB:', process.env.MONGO_DB || 'NOT SET');
console.log('MONGO_COLLECTION:', process.env.MONGO_COLLECTION || 'NOT SET');

// Check if we're in a Next.js environment
console.log('\nNext.js Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'NOT SET');
