'use client';

interface WalletListProps {
  primaryWallet: string | null;
  wallets: string[];
}

/**
 * Linked wallets display
 */
export function WalletList({ primaryWallet, wallets }: WalletListProps) {
  if (!wallets || wallets.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No linked wallets</p>
    );
  }

  return (
    <div className="space-y-2">
      {wallets.map((wallet, index) => {
        const isPrimary = wallet.toLowerCase() === primaryWallet?.toLowerCase();
        return (
          <div
            key={wallet}
            className={`
              flex items-center gap-3 p-3 rounded-lg border
              ${isPrimary ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50'}
            `}
          >
            <WalletIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <code className="text-sm font-mono text-gray-700 break-all">
                {formatAddress(wallet)}
              </code>
            </div>
            {isPrimary && (
              <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                Primary
              </span>
            )}
            <a
              href={`https://etherscan.io/address/${wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="View on Etherscan"
            >
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
        );
      })}
    </div>
  );
}

function formatAddress(address: string): string {
  if (address.length < 20) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}
