import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@/components/ui/tooltip';

interface HeaderProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function Header({ onMenuToggle, pageTitle }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationCount] = useState(3); // Ejemplo - tú podrías obtener esto de tu estado global
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const [currentTitle, setCurrentTitle] = useState(pageTitle || 'Dashboard');

  useEffect(() => {
    if (pageTitle) {
      setCurrentTitle(pageTitle);
    } else if (pathname) {
      // Extract the last part of the path and format it
      const segment = pathname.split('/').filter(Boolean).pop() || 'dashboard';
      const formattedTitle = segment.charAt(0).toUpperCase() + 
        segment.slice(1).replace(/-/g, ' ');
      setCurrentTitle(formattedTitle);
    }
  }, [pathname, pageTitle]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  return (
    <header className="bg-slate-50 shadow-sm z-10 transition-all duration-300 dark:bg-slate-800 dark:border-b dark:border-slate-700">
      <div className="flex h-16 items-center justify-between px-5 md:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            onClick={onMenuToggle}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-slate-800 hidden sm:block dark:text-white">{currentTitle}</h1>
        </div>
        
        <div className={`flex-1 max-w-2xl mx-4 ${isSearchOpen ? 'block' : 'hidden md:block'}`}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="block w-full rounded-full border-0 py-1.5 pl-10 pr-3 text-slate-900 bg-slate-100 focus:bg-slate-50 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all duration-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600 dark:placeholder:text-slate-500 dark:focus:ring-blue-600"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Tooltip content="Buscar">
            <button
              type="button"
              className="md:hidden rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              onClick={toggleSearch}
            >
              <span className="sr-only">Buscar</span>
              <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </Tooltip>
          
          <div className="relative">
            <Tooltip content="Notificaciones">
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <span className="sr-only">Ver notificaciones</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>
          
          <div className="relative">
            <button
              type="button"
              className="flex items-center rounded-full text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 transition-colors duration-200 dark:text-slate-400 dark:hover:text-white"
              onClick={toggleProfile}
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="relative">
                <UserCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" aria-hidden="true" />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-slate-50 dark:ring-slate-800" />
              </div>
              <span className="ml-2 hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">Admin</span>
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-slate-50 py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out dark:bg-slate-800 dark:ring-slate-700">
                <a href="#" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150 dark:text-slate-300 dark:hover:bg-slate-700">Perfil</a>
                <a href="#" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150 dark:text-slate-300 dark:hover:bg-slate-700">Configuración</a>
                <div className="border-t border-slate-200 my-1 dark:border-slate-700" />
                <a href="#" className="block px-4 py-2.5 text-sm text-red-600 hover:bg-slate-100 transition-colors duration-150 dark:text-red-400 dark:hover:bg-slate-700">Cerrar sesión</a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs for mobile */}
      <div className="sm:hidden px-5 py-2 text-sm">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1">
            <li className="inline-flex items-center">
              <a href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors duration-150 dark:text-slate-400 dark:hover:text-blue-400">
                Dashboard
              </a>
            </li>
            {currentTitle !== 'Dashboard' && (
              <>
                <span className="mx-1 text-slate-400">/</span>
                <li>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{currentTitle}</span>
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>
    </header>
  );
} 