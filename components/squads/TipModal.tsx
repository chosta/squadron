'use client';

import { useState } from 'react';
import type { SquadMemberWithUser } from '@/types/squad';
import { Button } from '@/components/ui/Button';
import { UserAvatarWithValidator } from '@/components/users/UserAvatarWithValidator';

type Currency = 'XP' | 'USDC' | 'ETH';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: SquadMemberWithUser;
  onTip: () => void;
}

const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

function XPIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function USDCIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9.5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5-1.5 2.5-3 2.5-3 1-3 2.5 1.5 2.5 3 2.5 3-1 3-2.5" />
    </svg>
  );
}

function ETHIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5L4.5 12.5L12 16.5L19.5 12.5L12 1.5Z" opacity="0.6" />
      <path d="M12 16.5L4.5 12.5L12 22.5L19.5 12.5L12 16.5Z" />
    </svg>
  );
}

const CURRENCIES: { id: Currency; name: string; icon: typeof XPIcon; color: string }[] = [
  { id: 'XP', name: 'XP (Ethos)', icon: XPIcon, color: 'text-yellow-400' },
  { id: 'USDC', name: 'USDC', icon: USDCIcon, color: 'text-blue-400' },
  { id: 'ETH', name: 'ETH', icon: ETHIcon, color: 'text-purple-400' },
];

export function TipModal({ isOpen, onClose, member, onTip }: TipModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('XP');
  const [amount, setAmount] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Cosmetic only - just close and show success
    onTip();
    onClose();
    setAmount('');
    setSelectedCurrency('XP');
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const displayName = member.user.ethosDisplayName || member.user.ethosUsername || 'Unknown';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/70" onClick={onClose} />
        <div className="relative bg-space-800 border border-space-600 rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-hull-100">Send Tip</h2>
            <button
              onClick={onClose}
              className="text-hull-400 hover:text-hull-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Member display */}
          <div className="flex items-center gap-3 p-3 bg-space-700 rounded-lg mb-6">
            <UserAvatarWithValidator
              src={member.user.ethosAvatarUrl}
              name={displayName}
              size="md"
              ethosProfileId={member.user.ethosProfileId}
            />
            <div>
              <p className="font-medium text-hull-100">{displayName}</p>
              {member.user.ethosScore !== null && (
                <p className="text-sm text-hull-400">Ethos Score: {member.user.ethosScore}</p>
              )}
            </div>
          </div>

          {/* Currency selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-hull-300 mb-3">
              Select Currency
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CURRENCIES.map((currency) => {
                const Icon = currency.icon;
                const isSelected = selectedCurrency === currency.id;
                return (
                  <button
                    key={currency.id}
                    onClick={() => setSelectedCurrency(currency.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-space-600 bg-space-700 hover:border-space-500'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${currency.color}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-400' : 'text-hull-300'}`}>
                      {currency.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-hull-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="any"
              className="block w-full rounded-lg border border-space-600 bg-space-700 px-3 py-2 text-hull-100 placeholder-hull-500 focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
            />
            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-3">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  className={`flex-1 px-2 py-1.5 text-sm rounded-md transition-colors ${
                    amount === value.toString()
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                      : 'bg-space-700 text-hull-400 border border-space-600 hover:border-space-500 hover:text-hull-300'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              Send Tip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
