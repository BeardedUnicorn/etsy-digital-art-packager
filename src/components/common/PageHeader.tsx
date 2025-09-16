import { ReactNode } from 'react';
import { theme } from '../../theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-900/70 bg-slate-950/50 p-8 shadow-lg shadow-black/40">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-purple-300/70">Workflow</p>
        <h2 className="text-3xl font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className={`${theme.subheading} max-w-3xl text-base`}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
