import { NextRequest, NextResponse } from 'next/server';
import { checkValidatorsBatch } from '@/lib/services/validator-service';

/**
 * POST /api/users/validators
 * Fetch validator status for multiple users by their Ethos profile IDs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileIds } = body;

    if (!Array.isArray(profileIds)) {
      return NextResponse.json(
        { error: 'profileIds must be an array' },
        { status: 400 }
      );
    }

    // Validate and filter to numbers only
    const validProfileIds = profileIds
      .filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)
      .slice(0, 100); // Limit to 100 to prevent abuse

    if (validProfileIds.length === 0) {
      return NextResponse.json({ validators: {} });
    }

    const validators = await checkValidatorsBatch(validProfileIds);

    return NextResponse.json({ validators });
  } catch (error) {
    console.error('Error fetching validators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validator status' },
      { status: 500 }
    );
  }
}
