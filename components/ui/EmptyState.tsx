import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm p-12 text-center">
      {icon && (
        <div className="mx-auto w-16 h-16 bg-space-700 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-hull-100">{title}</h3>
      {description && (
        <p className="mt-2 text-hull-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
