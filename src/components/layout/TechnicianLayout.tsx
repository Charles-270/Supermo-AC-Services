/**
 * Technician Dashboard Layout
 * Main layout wrapper for technician dashboard pages
 */

import { useState, useEffect } from 'react';
import { TechnicianSidebar } from './TechnicianSidebar';
import { NotificationBell } from '@/components/technician/NotificationBell';
import { cn } from '@/lib/utils';

interface TechnicianLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function TechnicianLayout({ children, className }: TechnicianLayoutProps) {
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
        <TechnicianSidebar
          variant="desktop"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
          className="fixed inset-y-0 left-0 z-30"
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <TechnicianSidebar
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
          <header className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden sticky top-0 z-40 safe-top">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900">Technician Hub</h1>
                </div>
              </div>
              <NotificationBell />
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