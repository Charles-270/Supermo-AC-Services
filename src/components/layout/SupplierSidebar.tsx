/**
 * Supplier Sidebar Navigation
 * Modern sidebar for supplier dashboard based on Google Stitch designs
 */


import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface SupplierNavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  id: string;
}

export const supplierNavItems: SupplierNavItem[] = [
  { 
    id: 'overview',
    label: 'Overview', 
    icon: <LayoutDashboard className="h-5 w-5" />, 
    path: '/dashboard/supplier' 
  },
  { 
    id: 'products',
    label: 'Manage Products', 
    icon: <Package className="h-5 w-5" />, 
    path: '/dashboard/supplier/products' 
  },
  { 
    id: 'settings',
    label: 'Settings', 
    icon: <Settings className="h-5 w-5" />, 
    path: '/dashboard/supplier/settings' 
  },
];

interface SupplierSidebarProps {
  className?: string;
  onNavigate?: () => void;
  onClose?: () => void;
  variant?: 'desktop' | 'mobile';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SupplierSidebar({
  className,
  onNavigate,
  onClose,
  variant = 'desktop',
  isCollapsed = false,
  onToggleCollapse,
}: SupplierSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/dashboard/supplier') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const containerClasses = cn(
    'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-gray-900">
                Supplier Hub
              </span>
            )}
          </div>
          
          {variant === 'mobile' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-2"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {supplierNavItems.map((item) => {
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={cn(
                    'flex-shrink-0',
                    active ? 'text-blue-600' : 'text-gray-400'
                  )}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.photoURL || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {profile?.displayName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.metadata?.companyName || profile?.displayName || 'Supplier'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email}
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
              className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
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