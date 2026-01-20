import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface UsersApiResponse {
  success: boolean;
  data?: Array<{
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
  }>;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<UsersApiResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Note: Users are created through the auth flow (/api/auth/sync), not this endpoint.
// This POST is disabled for the new auth-based user model.
