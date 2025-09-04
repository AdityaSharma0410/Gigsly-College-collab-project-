import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/reviews?taskId=...&userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const where: any = {};
    if (taskId) where.taskId = taskId;
    if (userId) where.userId = userId;
    const reviews = await prisma.review.findMany({
      where,
      include: { user: true, task: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const { rating, comment, userId, taskId } = await req.json();
    if (!rating || !comment || !userId || !taskId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: { rating, comment, userId, taskId },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
} 