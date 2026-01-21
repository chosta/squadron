import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import { redirect } from 'next/navigation';
import { MyApplicationsClient } from './MyApplicationsClient';

export default async function MyApplicationsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const applications = await positionService.getUserApplications(session.userId);

  return <MyApplicationsClient initialApplications={applications} />;
}
