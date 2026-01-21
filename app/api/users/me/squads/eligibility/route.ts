import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import type { SquadCreationEligibility } from '@/types/squad';

interface EligibilityApiResponse {
  success: boolean;
  data?: SquadCreationEligibility;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<EligibilityApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const eligibility = await squadService.canUserCreateSquad(session.userId);

    return NextResponse.json({ success: true, data: eligibility });
  } catch (error) {
    console.error('Error checking squad eligibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}
