import React, { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function PageContainer({ title, children, actions }: PageContainerProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function PageCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, description, icon, className = '' }: StatCardProps) {
  // Check if we're using the gradient background (indicated by having a className with color values)
  const isGradient = className.includes('from-') || className.includes('to-');
  
  if (isGradient) {
    return (
      <div className={`rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 bg-gradient-to-br ${className}`}>
        <div className="flex items-center">
          {icon && (
            <div className="rounded-full bg-white/20 p-3 mr-4">{icon}</div>
          )}
          <div>
            <h2 className="text-sm font-medium">{title}</h2>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {description && <p className="mt-1 text-xs opacity-90">{description}</p>}
          </div>
        </div>
      </div>
    );
  }
  
  // Default card style
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 ${className}`}>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  );
} 