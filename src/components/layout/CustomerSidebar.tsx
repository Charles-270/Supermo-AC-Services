/**
 * Customer Sidebar Navigation
 * Persistent sidebar for customer dashboard navigation
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Snowflake, Calendar, FileText, ShoppingCart, Package, User, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileDialog } from '@/components/profile/ProfileDialog';

export interface CustomerNavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  section?: string;
}

export const customerNavItems: CustomerNavItem[] = [
  { label: 'Book Services', icon: <Calendar className="h-5 w-5" />, path: '/book-services', section: 'BOOKINGS' },
  { label: 'My Bookings', icon: <FileText className="h-5 w-5" />, path: '/customer/bookings', section: 'BOOKINGS' },
  { label: 'Shop Products', icon: <ShoppingCart className="h-5 w-5" />, path: '/products', section: 'E-COMMERCE' },
  { label: 'My Orders', icon: <Package className="h-5 w-5" />, path: '/orders', section: 'E-COMMERCE' },
];

interface CustomerSidebarProps {
  className?: string;
  onNavigate?: () => void;
  onClose?: () => void;
  variant?: 'desktop' | 'mobile';
}

export function CustomerSidebar({
  className,
  onNavigate,
  onClose,
  variant = 'desktop',
}: CustomerSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const sections = Array.from(
    new Set(customerNavItems.map((item) => item.section).filter(Boolean))
  );

  const containerClasses =
    variant === 'mobile'
      ? 'relative flex h-full w-full max-w-xs flex-col bg-[#1a2332] text-white shadow-xl'
      : 'fixed left-0 top-0 hidden h-screen w-64 bg-[#1a2332] text-white lg:flex lg:flex-col';

  return (
    <aside className={cn(containerClasses, className)}>
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => {
            navigate('/');
            onNavigate?.();
          }}
        >
          <Snowflake className="h-8 w-8 text-cyan-400" />
          <span className="text-xl font-bold">CoolAir</span>
        </div>
        {variant === 'mobile' && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-neutral-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {sections.map((section) => (
          <div key={section} className="mb-6">
            <div className="px-6 mb-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {section}
              </p>
            </div>
            <div className="space-y-1">
              {customerNavItems
                .filter(item => item.section === section)
                .map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      onNavigate?.();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-white/10 text-white border-r-4 border-cyan-400'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={() => setShowProfileDialog(true)}
          className="w-full flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">
              {profile?.displayName || 'User'}
            </p>
            <p className="text-xs text-neutral-400">View profile</p>
          </div>
        </button>
        <button
          onClick={() => {
            onNavigate?.();
            signOut();
          }}
          className="w-full flex items-center gap-3 text-left px-2 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog 
        open={showProfileDialog} 
        onOpenChange={setShowProfileDialog} 
      />
    </aside>
  );
}
