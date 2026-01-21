import { NextRequest, NextResponse } from 'next/server';
import { positionService } from '@/lib/services/position-service';

// This endpoint is meant to be called by a cron job (e.g., Vercel Cron)
// It processes expired positions and applications

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if configured
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await positionService.processExpirations();

    return NextResponse.json({
      success: true,
      data: {
        expiredPositions: result.expiredPositions,
        expiredApplications: result.expiredApplications,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error processing expirations:', error);
    const message = error instanceof Error ? error.message : 'Failed to process expirations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
