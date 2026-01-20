import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { UpdateUserInput } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface UserApiResponse {
  success: boolean;
  data?: {
    id: string;
    privyId: string;
    ethosDisplayName: string | null;
    ethosUsername: string | null;
    ethosAvatarUrl: string | null;
    ethosScore: number | null;
    email: string | null;
    customDisplayName: string | null;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<UserApiResponse>> {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        privyId: true,
        ethosDisplayName: true,
        ethosUsername: true,
        ethosAvatarUrl: true,
        ethosScore: true,
        email: true,
        customDisplayName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<UserApiResponse>> {
  try {
    const { id } = await params;
    const body: UpdateUserInput = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Only allow updating role, status, email, customDisplayName, preferences
    const updateData: Record<string, unknown> = {};
    if (body.email !== undefined) updateData.email = body.email;
    if (body.customDisplayName !== undefined) updateData.customDisplayName = body.customDisplayName;
    if (body.preferences !== undefined) updateData.preferences = body.preferences;
    if (body.role) updateData.role = body.role;
    if (body.status) updateData.status = body.status;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        privyId: true,
        ethosDisplayName: true,
        ethosUsername: true,
        ethosAvatarUrl: true,
        ethosScore: true,
        email: true,
        customDisplayName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<UserApiResponse>> {
  try {
    const { id } = await params;
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
