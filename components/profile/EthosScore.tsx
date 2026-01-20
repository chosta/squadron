'use client';

interface EthosScoreProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Visual display of credibility score (0-2000 scale) with color coding
 */
export function EthosScore({ score, size = 'md' }: EthosScoreProps) {
  if (score === null || score === undefined) {
    return (
      <div className="text-gray-400 text-sm">
        No score available
      </div>
    );
  }

  const { color, bgColor, label } = getScoreInfo(score);

  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-bold',
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={`rounded-lg ${bgColor} ${containerClasses[size]}`}>
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} ${color}`}>
          {score}
        </div>
        <div className="flex flex-col">
          <span className={`text-xs uppercase tracking-wide ${color}`}>
            {label}
          </span>
          <span className="text-xs text-gray-500">
            / 2000
          </span>
        </div>
      </div>
      <ScoreBar score={score} />
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const percentage = Math.min((score / 2000) * 100, 100);
  const { barColor } = getScoreInfo(score);

  return (
    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${barColor} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function getScoreInfo(score: number): {
  color: string;
  bgColor: string;
  barColor: string;
  label: string;
} {
  if (score >= 1500) {
    return {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      barColor: 'bg-emerald-500',
      label: 'Excellent',
    };
  }
  if (score >= 1000) {
    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      barColor: 'bg-blue-500',
      label: 'Good',
    };
  }
  if (score >= 500) {
    return {
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      barColor: 'bg-amber-500',
      label: 'Fair',
    };
  }
  return {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    barColor: 'bg-red-500',
    label: 'Low',
  };
}
