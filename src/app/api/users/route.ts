import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users - List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { joinedAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { phone, name, email, password } = data;
    if (!phone || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newUser = await prisma.user.create({
      data: {
        phone,
        name,
        email,
        password,
      },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PATCH /api/users - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, name, email, phone } = data;
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 