/**
 * Supplier Dashboard Layout
 * Main layout wrapper for supplier dashboard pages
 */

import { useState, useEffect } from 'react';
import { SupplierSidebar } from './SupplierSidebar';
import { cn } from '@/lib/utils';

interface SupplierLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SupplierLayout({ children, className }: SupplierLayoutProps) {
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
        <SupplierSidebar
          variant="desktop"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
          className="fixed inset-y-0 left-0 z-30"
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <SupplierSidebar
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
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900">Supplier Hub</h1>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={cn('min-h-screen', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}