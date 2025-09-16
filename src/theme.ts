export const theme = {
  appBackground: 'bg-slate-950 text-slate-100',
  appGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
  panel: 'bg-slate-900/80 border border-slate-800 shadow-xl shadow-black/50 backdrop-blur',
  panelInset: 'bg-slate-900/60 border border-slate-800',
  heading: 'text-slate-100',
  subheading: 'text-slate-400',
  muted: 'text-slate-500',
  subtleText: 'text-slate-400',
  accentText: 'text-purple-300',
  accentButton:
    'bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 hover:from-purple-400 hover:via-indigo-400 hover:to-sky-400 focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-slate-950',
  subtleButton:
    'bg-slate-800/70 hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950',
  destructiveButton:
    'bg-rose-500 hover:bg-rose-400 focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950',
  successButton:
    'bg-emerald-500 hover:bg-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950',
  input:
    'bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
  badge: 'bg-slate-800/80 text-slate-300 border border-slate-700',
  badgeAccent: 'bg-purple-500/20 text-purple-200 border border-purple-500/30',
  badgeWarning: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
  divider: 'border-slate-800',
  navActive:
    'bg-slate-800/80 text-slate-100 border border-slate-700/70 shadow-lg shadow-black/40',
  navInactive: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
};

export type Theme = typeof theme;
