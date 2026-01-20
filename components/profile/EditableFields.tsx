'use client';

import { useState } from 'react';
import type { UserWithEthos, UpdateUserRequest } from '@/types/auth';

interface EditableFieldsProps {
  user: UserWithEthos;
  onSave: (data: UpdateUserRequest) => Promise<void>;
  isSaving: boolean;
}

/**
 * Editable app settings form
 */
export function EditableFields({ user, onSave, isSaving }: EditableFieldsProps) {
  const [email, setEmail] = useState(user.email || '');
  const [customDisplayName, setCustomDisplayName] = useState(user.customDisplayName || '');
  const [isDirty, setIsDirty] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSave({
      email: email || undefined,
      customDisplayName: customDisplayName || undefined,
    });

    setIsDirty(false);
  };

  const handleChange = (setter: (value: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(e.target.value);
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <EditIcon className="w-4 h-4 text-gray-400" />
          App Settings
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleChange(setEmail)}
            placeholder="your@email.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used for notifications and account recovery
          </p>
        </div>

        <div>
          <label htmlFor="customDisplayName" className="block text-sm font-medium text-gray-700">
            Custom Display Name
          </label>
          <input
            type="text"
            id="customDisplayName"
            value={customDisplayName}
            onChange={handleChange(setCustomDisplayName)}
            placeholder={user.ethosData.displayName || 'Your display name'}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Override your Ethos display name within this app
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}
