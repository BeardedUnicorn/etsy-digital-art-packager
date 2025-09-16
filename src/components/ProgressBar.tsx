import { ProcessingProgress } from '../types';
import { Panel } from './common/Panel';
import { theme } from '../theme';

interface ProgressBarProps {
  progress: ProcessingProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  if (!progress.total || progress.isComplete) {
    return null;
  }

  return (
    <Panel className="max-w-3xl" title="Processing" description="Generating all requested sizes. This can take a moment for large images.">
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
