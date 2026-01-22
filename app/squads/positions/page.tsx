import { positionService } from '@/lib/services/position-service';
import { PublicNavbar } from '@/components/navigation';
import { BrowsePositionsClient } from './BrowsePositionsClient';

export default async function BrowsePositionsPage() {
  const positions = await positionService.listOpenPositions({ limit: 50 });

  return (
    <div className="min-h-screen bg-space-900">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BrowsePositionsClient initialPositions={positions} />
      </div>
    </div>
  );
}
