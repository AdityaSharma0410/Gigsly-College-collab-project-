import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/applications?taskId=...&userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const where: any = {};
    if (taskId) where.taskId = taskId;
    if (userId) where.userId = userId;
    const applications = await prisma.application.findMany({
      where,
      include: { user: true, task: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST /api/applications
export async function POST(req: NextRequest) {
  try {
    const { bid, message, userId, taskId } = await req.json();
    if (!bid || !message || !userId || !taskId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const application = await prisma.application.create({
      data: { bid, message, userId, taskId },
    });
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
} 