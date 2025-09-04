import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/tasks - List all tasks, with optional location filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    let tasks = await prisma.task.findMany({
      include: { postedBy: true },
      orderBy: { postedAt: 'desc' },
    });
    if (location) {
      // Sort: exact match first, then others
      tasks = [
        ...tasks.filter(task => task.location.toLowerCase() === location.toLowerCase()),
        ...tasks.filter(task => task.location.toLowerCase() !== location.toLowerCase()),
      ];
    }
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { title, description, budget, category, location, postedById } = data;
    if (!title || !description || !budget || !category || !location || !postedById) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        budget: Number(budget),
        category,
        location,
        postedById,
      },
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
} 