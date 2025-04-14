import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ArrowUpTrayIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  collapsed?: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Inventario', href: '/inventory', icon: CubeIcon },
    { name: 'Proyectos', href: '/projects', icon: ClipboardDocumentListIcon },
    { name: 'Importar', href: '/import', icon: ArrowUpTrayIcon },
    { name: 'Reportes', href: '/reports', icon: DocumentChartBarIcon },
    { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className={twMerge(
      'h-screen bg-gray-800 text-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        {collapsed ? (
          <span className="text-xl font-bold">LI</span>
        ) : (
          <span className="text-xl font-bold">Lumo Inventory</span>
        )}
      </div>
      <nav className="mt-5 px-2">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={twMerge(
                  'flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 