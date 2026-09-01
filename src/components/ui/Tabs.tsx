import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center gap-1 bg-forma-obsidian/80 p-1 rounded-lg border border-forma-border', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer select-none',
              isActive
                ? 'bg-forma-elevated text-forma-white border border-forma-border/80 shadow-sm font-semibold'
                : 'text-forma-muted hover:text-forma-white hover:bg-forma-surface/60'
            )}
          >
            {tab.icon && <span className={cn('w-3.5 h-3.5', isActive ? 'text-forma-lime' : 'text-forma-muted')}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded font-mono',
                  isActive ? 'bg-forma-limeDim text-forma-lime' : 'bg-forma-surface text-forma-subtle'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
