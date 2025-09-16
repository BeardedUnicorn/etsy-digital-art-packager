import { ReactNode } from 'react';
import { theme } from '../../theme';
import { classNames } from '../../utils/classNames';

export interface NavigationItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface SidebarLayoutProps {
  navigation: NavigationItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function SidebarLayout({ navigation, activeId, onNavigate, children, footer }: SidebarLayoutProps) {
  return (
    <div className={classNames('min-h-screen', theme.appGradient, theme.appBackground)}>
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-900/70 bg-slate-950/80 px-6 py-10 lg:block">
          <div className="flex flex-col gap-10">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-slate-500">Image Toolkit</div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-100">Crop & Generate</h1>
            </div>

            <nav className="flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={classNames(
                      'group flex flex-col rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                      isActive
                        ? theme.navActive
                        : classNames('border-transparent bg-transparent', theme.navInactive),
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <span
                          className={classNames(
                            'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200',
                            isActive
                              ? 'border-purple-400/50 bg-purple-500/10 text-purple-200'
                              : 'border-slate-800 bg-slate-900/70 text-slate-500 group-hover:text-slate-200',
                          )}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    {item.description && (
                      <p className="mt-2 text-xs text-slate-400 group-hover:text-slate-300">
                        {item.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </nav>

            {footer && <div className="mt-auto text-xs text-slate-500">{footer}</div>}
          </div>
        </aside>

        <main className="flex w-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-900/70 bg-slate-950/60 px-6 py-6 shadow-lg shadow-black/40 lg:hidden">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-slate-500">Image Toolkit</div>
              <h1 className="mt-1 text-lg font-semibold text-slate-100">Crop & Generate</h1>
            </div>
            <div className="flex gap-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={classNames(
                    'rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors duration-200',
                    item.id === activeId ? theme.navActive : theme.navInactive,
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-8 lg:px-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
