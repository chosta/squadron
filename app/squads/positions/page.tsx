import Link from 'next/link';
import { positionService } from '@/lib/services/position-service';
import { PublicNavbar } from '@/components/navigation';
import { BrowsePositionsClient } from './BrowsePositionsClient';

export default async function BrowsePositionsPage() {
  const positions = await positionService.listOpenPositions({ limit: 50 });

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Squads</h1>
          <p className="mt-2 text-gray-600">
            Browse all squads and find your next team.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/squads"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              All Squads
            </Link>
            <span className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg">
              Open Positions
            </span>
          </div>
        </div>
        <BrowsePositionsClient initialPositions={positions} />
      </div>
    </div>
  );
}
