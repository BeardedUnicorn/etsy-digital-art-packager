import { ReactNode } from 'react';
import { theme } from '../../theme';

type PanelProps = {
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

const combine = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export function Panel({
  title,
  description,
  headerAction,
  children,
  className,
  contentClassName,
}: PanelProps) {
  return (
    <section className={combine(theme.panel, 'rounded-2xl p-6', className)}>
      {(title || description || headerAction) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            {title && <h3 className={combine('text-xl font-semibold', theme.heading)}>{title}</h3>}
            {description && <p className={combine('text-sm mt-1', theme.subheading)}>{description}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={combine('space-y-6', contentClassName)}>{children}</div>
    </section>
  );
}
