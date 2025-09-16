import { ReactNode } from 'react';
import { theme } from '../../theme';
import { classNames } from '../../utils/classNames';

type PanelProps = {
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Panel({
  title,
  description,
  headerAction,
  children,
  className,
  contentClassName,
}: PanelProps) {
  return (
    <section className={classNames(theme.panel, 'rounded-2xl p-6', className)}>
      {(title || description || headerAction) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            {title && <h3 className={classNames('text-xl font-semibold', theme.heading)}>{title}</h3>}
            {description && <p className={classNames('text-sm mt-1', theme.subheading)}>{description}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={classNames('space-y-6', contentClassName)}>{children}</div>
    </section>
  );
}
