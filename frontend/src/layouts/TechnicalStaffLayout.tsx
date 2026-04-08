import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Layout } from '../components/layout/Layout';
import type { NavItem } from '../components/layout/Sidebar';
import { LayoutDashboard, Ticket, BookOpen, ArrowUpRight, BarChart3 } from 'lucide-react';
import { NetworkErrorModal, useNetworkStatus } from '../shared';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/technical-staff/dashboard' },
  { id: 'assigned-tickets', label: 'Assigned Tickets', icon: Ticket, path: '/technical-staff/my-tickets' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/technical-staff/reports' },
  { id: 'escalation', label: 'Escalation', icon: ArrowUpRight, path: '/technical-staff/escalation' },
  { id: 'knowledge-hub', label: 'Knowledge Hub', icon: BookOpen, path: '/technical-staff/knowledge-hub' },
];


export function TechnicalStaffLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    if (path === 'logout') {
      logout();
      navigate('/login', { replace: true });
      return;
    }
    navigate(path);
  };

  const { isOffline, retry, dismiss, retrying } = useNetworkStatus();

  if (!user) return null;

  return (
    <Layout
      role="Technical Staff"
      currentPage={location.pathname}
      onNavigate={handleNavigate}
      isDark={isDark}
      onToggleDark={toggleDark}
      navItems={NAV_ITEMS}
    >
      <NetworkErrorModal isOpen={isOffline} onRetry={retry} onDismiss={dismiss} retrying={retrying} />
      <Outlet />
    </Layout>
  );
}
