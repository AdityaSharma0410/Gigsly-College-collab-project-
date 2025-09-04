import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '../send-otp/route';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }
    const record = otpStore[phone];
    if (!record) {
      return NextResponse.json({ error: 'No OTP sent to this number' }, { status: 400 });
    }
    if (Date.now() > record.expires) {
      delete otpStore[phone];
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }
    if (record.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
    delete otpStore[phone];
    return NextResponse.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
} 