'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/ui/sidebar';
import Header from '@/components/ui/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const pathname = usePathname();

  // Determine page title from URL path
  useEffect(() => {
    const path = pathname.split('/').filter(Boolean);
    if (path.length > 1) {
      // Capitalize the last segment of the path
      const title = path[path.length - 1].charAt(0).toUpperCase() + 
                    path[path.length - 1].slice(1).replace(/-/g, ' ');
      setPageTitle(title);
    } else {
      setPageTitle('Dashboard');
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div 
        className="flex flex-1 flex-col transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: sidebarCollapsed ? '96px' : '288px',
          width: `calc(100% - ${sidebarCollapsed ? '96px' : '288px'})` 
        }}
      >
        <Header onMenuToggle={toggleSidebar} pageTitle={pageTitle} />
        
        <main className="flex-1 overflow-auto p-5 md:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900">
          <div className="w-full max-w-screen-2xl mx-auto">
            <div className="bg-slate-50 rounded-2xl shadow-sm p-6 mb-16 dark:bg-slate-800 dark:border dark:border-slate-700">
              {children}
            </div>
          </div>
        </main>
        
        <footer className="bg-slate-50 border-t border-slate-200 py-4 px-6 text-center text-sm text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Lumo Inventory System</p>
        </footer>
      </div>
    </div>
  );
} 