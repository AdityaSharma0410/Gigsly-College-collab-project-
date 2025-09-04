import { NextRequest, NextResponse } from 'next/server';

const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

// In-memory store for OTPs (for demo; use Redis or DB for production)
const otpStore: { [phone: string]: { otp: string; expires: number } } = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    const otp = generateOTP();
    otpStore[phone] = { otp, expires: Date.now() + OTP_EXPIRY };

    // DEMO MODE: Log OTP to console instead of sending SMS
    console.log(`Demo OTP for ${phone}: ${otp}`);
    return NextResponse.json({ success: true, message: 'OTP generated and logged to console (demo mode)' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// For demo: export the otpStore for verification route
export { otpStore }; 