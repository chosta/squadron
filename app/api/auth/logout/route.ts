import { NextResponse } from 'next/server';

interface LogoutResponse {
  success: boolean;
  message?: string;
}

/**
 * POST /api/auth/logout
 *
 * Logout the current user.
 * Clears any server-side session state.
 * Note: Client-side Privy logout should also be called.
 */
export async function POST(): Promise<NextResponse<LogoutResponse>> {
  try {
    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear any session cookies if they exist
    response.cookies.delete('privy-token');
    response.cookies.delete('squadron_session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
