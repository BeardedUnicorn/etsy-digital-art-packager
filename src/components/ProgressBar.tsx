import { ProcessingProgress } from '../types';
import { Panel } from './common/Panel';
import { theme } from '../theme';

interface ProgressBarProps {
  progress: ProcessingProgress;
  variant?: 'detailed' | 'compact';
}

export function ProgressBar({ progress, variant = 'detailed' }: ProgressBarProps) {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  if (!progress.total || progress.isComplete) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="flex w-full items-center gap-4 rounded-xl border border-slate-900/80 bg-slate-950/80 px-4 py-3 shadow-lg shadow-black/20">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-800/80">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
          <span>{percentage}%</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {progress.current}/{progress.total}
          </span>
          <span className="inline-flex h-3 w-3 animate-spin rounded-full border border-slate-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <Panel className="mx-auto w-full max-w-3xl" title="Processing" description="Generating all requested sizes. This can take a moment for large images.">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className={`${theme.subheading} font-medium`}>Progress</span>
          <span className={`${theme.subheading}`}>
            {progress.current} of {progress.total}
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-800/80">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className={`text-sm ${theme.subheading}`}>
          <p>{progress.currentTask}</p>
          <p className="text-xs mt-1">{percentage}% complete</p>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
          <span>Please keep this window open.</span>
        </div>
      </div>
    </Panel>
  );
}

export type { ProgressBarProps };
