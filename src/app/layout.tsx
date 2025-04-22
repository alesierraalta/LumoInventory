import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/radix-tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lumo Inventory | Gestión de Inventario y Proyectos',
  description: 'Sistema para gestión de inventario de iluminación y administración de proyectos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Toaster position="top-right" />
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
} 