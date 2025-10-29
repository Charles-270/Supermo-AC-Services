/**
 * Admin Dashboard Layout
 * Main layout wrapper for admin dashboard pages
 */

import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function AdminLayout({ 
  children, 
  className, 
  title, 
  subtitle, 
  breadcrumbs, 
  actions 
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSidebarToggle = () => {
    if (!isMobile) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <AdminSidebar
          variant="desktop"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
          className="fixed inset-y-0 left-0 z-30"
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <AdminSidebar
          variant="mobile"
          onClose={closeMobileMenu}
          onNavigate={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          !isMobile && (isSidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Open navigation menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-md">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900">Admin Console</h1>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Desktop Header */}
        {!isMobile && (title || breadcrumbs || actions) && (
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex mb-2" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                      {breadcrumbs.map((item, index) => (
                        <li key={index} className="flex items-center">
                          {index > 0 && (
                            <svg className="h-4 w-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {item.href ? (
                            <a href={item.href} className="hover:text-gray-700">
                              {item.label}
                            </a>
                          ) : (
                            <span className="text-gray-900 font-medium">{item.label}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
                
                {/* Title and Subtitle */}
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                      <p className="text-gray-600 mt-1">{subtitle}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Actions */}
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={cn('min-h-screen', className)}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}