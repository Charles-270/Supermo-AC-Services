/**
 * Admin Sidebar Navigation
 * Modern sidebar for admin dashboard based on Google Stitch designs
 * Redesigned: October 2025
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Menu,
  X,
  LogOut,
  Shield,
  ShoppingCart,
  Package,
  FileText,
  Truck,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface AdminNavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  id: string;
  children?: AdminNavItem[];
}

export const adminNavItems: AdminNavItem[] = [
  { 
    id: 'dashboard',
    label: 'Dashboard', 
    icon: <LayoutDashboard className="h-5 w-5" />, 
    path: '/dashboard/admin' 
  },
];

export const managementNavItems: AdminNavItem[] = [
  { 
    id: 'users',
    label: 'Users', 
    icon: <Users className="h-5 w-5" />, 
    path: '/dashboard/admin/users' 
  },
  { 
    id: 'ecommerce',
    label: 'E-Commerce', 
    icon: <ShoppingCart className="h-5 w-5" />, 
    path: '/dashboard/admin/ecommerce',
    children: [
      {
        id: 'manage-product',
        label: 'Manage Product',
        icon: <Package className="h-4 w-4" />,
        path: '/dashboard/admin/ecommerce/products'
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: <FileText className="h-4 w-4" />,
        path: '/dashboard/admin/ecommerce/orders'
      },
      {
        id: 'catalog',
        label: 'Catalog',
        icon: <Package className="h-4 w-4" />,
        path: '/dashboard/admin/ecommerce/catalog'
      }
    ]
  },
  { 
    id: 'suppliers',
    label: 'Suppliers', 
    icon: <Truck className="h-5 w-5" />, 
    path: '/dashboard/admin/suppliers' 
  },
  { 
    id: 'bookings',
    label: 'Bookings', 
    icon: <Calendar className="h-5 w-5" />, 
    path: '/dashboard/admin/bookings' 
  },
];

export const platformNavItems: AdminNavItem[] = [
  { 
    id: 'analytics',
    label: 'Analytics', 
    icon: <BarChart3 className="h-5 w-5" />, 
    path: '/dashboard/admin/analytics' 
  },
  { 
    id: 'settings',
    label: 'Settings', 
    icon: <Settings className="h-5 w-5" />, 
    path: '/dashboard/admin/settings' 
  },
];

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
  onClose?: () => void;
  variant?: 'desktop' | 'mobile';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  className,
  onNavigate,
  onClose,
  variant = 'desktop',
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['ecommerce']);

  const isActive = (path: string) => {
    if (path === '/dashboard/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) return;
    
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const containerClasses = cn(
    'flex flex-col transition-all duration-300',
    'bg-[#1E293B] text-white', // Dark navy theme matching Google Stitch
    variant === 'mobile'
      ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-xl'
      : isCollapsed
      ? 'w-16'
      : 'w-64',
    className
  );

  return (
    <>
      {/* Mobile overlay */}
      {variant === 'mobile' && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={containerClasses}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-white tracking-tight">
                Admin Console
              </span>
            )}
          </div>
          
          {variant === 'mobile' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          {/* Dashboard */}
          <div className="space-y-1">
            {adminNavItems.map((item) => {
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* MANAGEMENT Section */}
          {!isCollapsed && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                MANAGEMENT
              </h3>
              <div className="space-y-1">
                {managementNavItems.map((item) => {
                  const active = isActive(item.path);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedSections.includes(item.id);
                  
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            toggleSection(item.id);
                          } else {
                            handleNavigation(item.path);
                          }
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                          active && !hasChildren
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                        )}
                      >
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {hasChildren && (
                          <div className="flex-shrink-0 transition-transform duration-200">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </button>
                      
                      {/* Sub-menu */}
                      {hasChildren && isExpanded && (
                        <div className="ml-8 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-2">
                          {item.children?.map((child) => {
                            const childActive = isActive(child.path);
                            
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleNavigation(child.path)}
                                className={cn(
                                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200',
                                  childActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                )}
                              >
                                <div className="flex-shrink-0">
                                  {child.icon}
                                </div>
                                <span className="truncate">{child.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PLATFORM Section */}
          {!isCollapsed && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                PLATFORM
              </h3>
              <div className="space-y-1">
                {platformNavItems.map((item) => {
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                        active
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      )}
                    >
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsed state navigation */}
          {isCollapsed && (
            <div className="space-y-1">
              {[...managementNavItems, ...platformNavItems].map((item) => {
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200',
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    )}
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-10 w-10 ring-2 ring-slate-700">
              <AvatarImage src={profile?.photoURL || undefined} />
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {profile?.displayName?.charAt(0) || profile?.email?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.displayName || 'Admin User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {profile?.email || 'admin@example.com'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onNavigate?.();
                signOut();
              }}
              className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}