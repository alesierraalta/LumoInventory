import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ArrowUpTrayIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightEndOnRectangleIcon,
  ChevronDoubleLeftIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  group?: string;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Inventario': true,
    'Proyectos': true,
    'Locaciones': true
  });
  
  const toggleGroup = (group: string) => {
    if (collapsed) return;
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    
    // Caracas group - includes categories for Caracas
    { name: 'Inventario', href: '/inventory', icon: BuildingOfficeIcon, group: 'Caracas' },
    { name: 'Categorías', href: '/categories?location=caracas', icon: TagIcon, group: 'Caracas' },
    
    // Valencia group - includes categories for Valencia
    { name: 'Inventario', href: '/inventory/valencia', icon: MapPinIcon, group: 'Valencia' },
    { name: 'Categorías', href: '/categories?location=valencia', icon: TagIcon, group: 'Valencia' },
    
    { name: 'Proyectos', href: '/projects', icon: ClipboardDocumentListIcon, group: 'Proyectos' },
    { name: 'Importar', href: '/import', icon: ArrowUpTrayIcon },
    { name: 'Reportes', href: '/reports', icon: DocumentChartBarIcon },
    { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Agrupar los elementos de navegación por grupo
  const navGroups: Record<string, NavigationItem[]> = {};
  const ungroupedItems: NavigationItem[] = [];
  
  navigation.forEach(item => {
    if (item.group) {
      if (!navGroups[item.group]) navGroups[item.group] = [];
      navGroups[item.group].push(item);
    } else {
      ungroupedItems.push(item);
    }
  });

  return (
    <div className={twMerge(
      'h-screen bg-gradient-to-b from-slate-100 to-slate-50 text-slate-800 transition-all duration-300 shadow-xl overflow-hidden fixed dark:from-slate-900 dark:to-slate-800 dark:text-white z-30',
      collapsed ? 'w-24' : 'w-72'
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
        {collapsed ? (
          <Tooltip content="Lumo Inventory" position="right">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
              <span className="text-xl font-bold text-white">LI</span>
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mr-3">
              <span className="text-xl font-bold text-white">LI</span>
            </div>
            <span className="text-xl font-semibold text-slate-800 dark:text-white">
              Lumo Inventory
            </span>
          </div>
        )}
      </div>
      
      <nav className="h-[calc(100vh-4rem)] flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-800">
        <div className="flex-grow py-5 px-4 space-y-2">
          <div className="mb-6">
            {/* Elementos sin grupo */}
            {ungroupedItems.slice(0, 1).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  'flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-150 mb-2',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                )}
              >
                {collapsed ? (
                  <Tooltip content={item.name} position="right">
                    <item.icon className="h-6 w-6 mx-auto flex-shrink-0" aria-hidden="true" />
                  </Tooltip>
                ) : (
                  <>
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                  </>
                )}
              </Link>
            ))}
          </div>
          
          {/* Locations Groups First */}
          {Object.keys(navGroups)
            .filter(groupName => groupName === 'Caracas' || groupName === 'Valencia')
            .map((groupName) => (
              <div key={groupName} className="mb-4">
                <button
                  type="button"
                  onClick={() => toggleGroup(groupName)}
                  className={twMerge(
                    'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors mb-1',
                    collapsed ? 'justify-center' : '',
                    'text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
                  )}
                >
                  {!collapsed && (
                    <>
                      <span>
                        {groupName === 'Caracas' && (
                          <span className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-2" /> {groupName}
                          </span>
                        )}
                        {groupName === 'Valencia' && (
                          <span className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" /> {groupName}
                          </span>
                        )}
                      </span>
                      {openGroups[groupName] ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </>
                  )}
                  {collapsed && (
                    <Tooltip content={groupName} position="right">
                      <span className="text-xs uppercase bg-slate-200 dark:bg-slate-700 rounded-md px-2 py-1">
                        {groupName.charAt(0)}
                      </span>
                    </Tooltip>
                  )}
                </button>
                
                <div className={twMerge(
                  'space-y-1 pl-3 transition-all duration-200 overflow-hidden',
                  openGroups[groupName] || collapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}>
                  {navGroups[groupName].map((item) => (
                    <Link
                      key={item.name + item.href}
                      href={item.href}
                      className={twMerge(
                        'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        pathname === item.href || 
                        (item.href === '/inventory' && pathname === '/inventory') ||
                        (item.href === '/inventory/valencia' && pathname === '/inventory/valencia') ||
                        (item.href === '/categories?location=caracas' && pathname.includes('/categories') && pathname.includes('caracas')) ||
                        (item.href === '/categories?location=valencia' && pathname.includes('/categories') && pathname.includes('valencia'))
                          ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                      )}
                    >
                      {collapsed ? (
                        <Tooltip content={item.name === 'Inventario' ? `${groupName} - ${item.name}` : item.name} position="right">
                          <item.icon className="h-5 w-5 mx-auto flex-shrink-0" aria-hidden="true" />
                        </Tooltip>
                      ) : (
                        <>
                          <item.icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
                          <span>{item.name}</span>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
          ))}
          
          {/* Other Groups */}
          {Object.keys(navGroups)
            .filter(groupName => groupName !== 'Caracas' && groupName !== 'Valencia')
            .map((groupName) => (
              <div key={groupName} className="mb-4">
                <button
                  type="button"
                  onClick={() => toggleGroup(groupName)}
                  className={twMerge(
                    'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors mb-1',
                    collapsed ? 'justify-center' : '',
                    'text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
                  )}
                >
                  {!collapsed && (
                    <>
                      <span>{groupName}</span>
                      {openGroups[groupName] ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </>
                  )}
                  {collapsed && (
                    <Tooltip content={groupName} position="right">
                      <span className="text-xs uppercase bg-slate-200 dark:bg-slate-700 rounded-md px-2 py-1">{groupName.charAt(0)}</span>
                    </Tooltip>
                  )}
                </button>
                
                <div className={twMerge(
                  'space-y-1 pl-3 transition-all duration-200 overflow-hidden',
                  openGroups[groupName] || collapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}>
                  {navGroups[groupName].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={twMerge(
                        'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                      )}
                    >
                      {collapsed ? (
                        <Tooltip content={item.name} position="right">
                          <item.icon className="h-5 w-5 mx-auto flex-shrink-0" aria-hidden="true" />
                        </Tooltip>
                      ) : (
                        <>
                          <item.icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
                          <span>{item.name}</span>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
          ))}
          
          {/* Elementos sin grupo restantes */}
          {ungroupedItems.slice(1).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={twMerge(
                'flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-colors mb-2',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
              )}
            >
              {collapsed ? (
                <Tooltip content={item.name} position="right">
                  <item.icon className="h-6 w-6 mx-auto flex-shrink-0" aria-hidden="true" />
                </Tooltip>
              ) : (
                <>
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                </>
              )}
            </Link>
          ))}
        </div>
        
        <div className="mt-auto py-4 px-4 border-t border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
          <Link
            href="/logout"
            className={twMerge(
              'flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white',
              collapsed ? 'justify-center' : ''
            )}
          >
            {collapsed ? (
              <Tooltip content="Cerrar Sesión" position="right">
                <ArrowRightEndOnRectangleIcon className="h-6 w-6 mx-auto flex-shrink-0" aria-hidden="true" />
              </Tooltip>
            ) : (
              <>
                <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
                <span>Cerrar Sesión</span>
              </>
            )}
          </Link>
        </div>
      </nav>
    </div>
  );
} 