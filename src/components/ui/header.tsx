import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function Header({ onMenuToggle, pageTitle = 'Dashboard' }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            onClick={onMenuToggle}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">{pageTitle}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              type="button"
              className="flex rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <UserCircleIcon className="h-8 w-8" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 