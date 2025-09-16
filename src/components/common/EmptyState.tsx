import { ReactNode } from 'react';
import { theme } from '../../theme';
import { classNames } from '../../utils/classNames';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={classNames(
        theme.panel,
        'flex flex-col items-center justify-center gap-4 rounded-3xl px-8 py-12 text-center shadow-2xl shadow-black/30',
        className,
      )}
    >
      {icon && <div className="text-purple-300">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-slate-100">{title}</h3>
        {description && <p className={classNames('text-sm max-w-xl mx-auto', theme.subheading)}>{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export type { EmptyStateProps };
