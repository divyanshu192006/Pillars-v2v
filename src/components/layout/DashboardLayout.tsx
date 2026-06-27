import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Bell, LogOut, Menu, X, Globe, Shield, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
];

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export interface NavGroup {
  label: string;
  icon: React.ReactNode;
  /** If provided, clicking the group header navigates here */
  path?: string;
  /** Sub-items shown in collapsible section */
  children?: NavItem[];
  /** If true, render as a direct link with no sub-items */
  direct?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  titleKey: string;
  /** Pass either grouped nav (NavGroup[]) or flat nav (NavItem[]) */
  navItems: NavItem[] | NavGroup[];
}

function isNavGroup(items: NavItem[] | NavGroup[]): items is NavGroup[] {
  return items.length > 0 && ('direct' in items[0] || 'children' in items[0]);
}

// ─── Grouped sidebar nav ──────────────────────────────────────────────────────
function GroupedNav({ groups, location, onNavigate }: {
  groups: NavGroup[];
  location: { pathname: string };
  onNavigate?: () => void;
}) {
  // Auto-expand whichever group contains the active path
  const activeGroup = groups.findIndex(g =>
    (g.path && location.pathname === g.path) ||
    g.children?.some(c => location.pathname === c.path || location.pathname.startsWith(c.path + '/'))
  );
  const [expanded, setExpanded] = useState<number[]>(activeGroup >= 0 ? [activeGroup] : [0]);

  const toggle = (i: number) =>
    setExpanded(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  return (
    <div className="space-y-0.5">
      {groups.map((group, i) => {
        const isGroupActive = (group.path && location.pathname === group.path) ||
          group.children?.some(c => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));
        const isExpanded = expanded.includes(i);

        if (group.direct && group.path) {
          return (
            <Link key={i} to={group.path} onClick={onNavigate}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isGroupActive
                  ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-primary-50')}>
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                isGroupActive ? 'text-white' : 'text-gray-500')}>{group.icon}</span>
              {group.label}
            </Link>
          );
        }

        return (
          <div key={i}>
            <button
              onClick={() => { toggle(i); if (group.path && !group.children?.length) onNavigate?.(); }}
              className={cn('w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors text-left',
                isGroupActive && !isExpanded
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50')}
            >
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                isGroupActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500')}>
                {group.icon}
              </span>
              <span className="flex-1 truncate">{group.label}</span>
              {group.children?.length ? (
                isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              ) : null}
            </button>

            <AnimatePresence>
              {isExpanded && group.children && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-3">
                    {group.children.map(child => {
                      const isActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/');
                      return (
                        <Link key={child.path} to={child.path} onClick={onNavigate}
                          className={cn('flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                            isActive
                              ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700')}>
                          <span className="shrink-0">{child.icon}</span>
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Flat sidebar nav (for non-woman roles) ───────────────────────────────────
function FlatNav({ items, location, onNavigate }: {
  items: NavItem[];
  location: { pathname: string };
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-0.5">
      {items.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} onClick={onNavigate}
            className={cn('flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg' : 'text-gray-600 hover:bg-primary-50')}>
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export function DashboardLayout({ children, titleKey, navItems }: DashboardLayoutProps) {
  const { user, logout, isDemo, setLanguage } = useAuth();
  const { notifications } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const title = t(titleKey);
  const unread = notifications.filter(n => !n.read && (n.userId === user?.id || n.userId === 'all')).length;
  const grouped = navItems.length > 0 && ('direct' in navItems[0] || 'children' in navItems[0]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const renderNav = (onNavigate?: () => void) =>
    grouped
      ? <GroupedNav groups={navItems as NavGroup[]} location={location} onNavigate={onNavigate} />
      : <FlatNav items={navItems as NavItem[]} location={location} onNavigate={onNavigate} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      {/* ── Top header ── */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 hover:bg-gray-100 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to={user ? getDashboardPath(user.role) : '/'} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 shadow-md">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="hidden font-display text-lg font-bold gradient-text sm:block">MaaRaksha</span>
            </Link>
            {isDemo && <Badge variant="outline" className="hidden sm:flex text-xs">{t('demoMode')}</Badge>}
          </div>

          <h1 className="text-sm font-semibold text-gray-700 md:text-base truncate max-w-[200px]">{title}</h1>

          <div className="flex items-center gap-1.5">
            <select
              className="hidden rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium md:block focus:outline-none focus:ring-2 focus:ring-primary-200"
              value={user?.language || 'en'}
              onChange={e => setLanguage(e.target.value as Language)}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <Link to={`${location.pathname.split('/').slice(0, 3).join('/')}/notifications`} className="relative">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Bell className="h-5 w-5" />
              </Button>
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
              )}
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl"><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 p-4">
        {/* ── Desktop sidebar ── */}
        <nav className="hidden w-52 shrink-0 md:block">
          <div className="glass-card sticky top-20 rounded-2xl p-2.5 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {renderNav()}
          </div>
          {user && (
            <div className="mt-3 glass-card rounded-2xl p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-pink-400">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs capitalize text-gray-500">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
                onClick={() => setMobileOpen(false)} />
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl md:hidden flex flex-col">
                {/* Mobile drawer header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-display font-bold gradient-text">MaaRaksha</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="rounded-xl p-1.5 hover:bg-gray-100">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Language in mobile */}
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <select className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                    value={user?.language} onChange={e => setLanguage(e.target.value as Language)}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>

                {/* Mobile nav */}
                <div className="flex-1 overflow-y-auto p-3">
                  {renderNav(() => setMobileOpen(false))}
                </div>

                {/* User profile at bottom */}
                {user && (
                  <div className="border-t border-gray-100 p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="shrink-0">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 pb-24">{children}</main>
      </div>
    </div>
  );
}
