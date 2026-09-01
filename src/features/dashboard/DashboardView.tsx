import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sbGetDashboard, sbListActivityLogs } from '@/lib/supabase-db';
import { getDashboardForWorkspace, listActivityLogs } from '@/lib/storage';
import { DashboardWidget, ActivityLog } from '@/types';
import { StatWidget } from './StatWidget';
import { ChartWidget } from './ChartWidget';
import { TableWidget } from './TableWidget';
import { RecentRecordsWidget } from './RecentRecordsWidget';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/utils';
import {
  Sliders,
  Activity,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const { activeWorkspace, activeWorkspaceId, modules, setMode } = useWorkspace();
  const navigate = useNavigate();

  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const [dashResult, logs] = await Promise.all([
            sbGetDashboard(activeWorkspaceId).catch(() => ({ dashboard: null, widgets: [] })),
            sbListActivityLogs(activeWorkspaceId, 6).catch(() => []),
          ]);
          if (dashResult.widgets && dashResult.widgets.length > 0) {
            setWidgets(dashResult.widgets);
          } else {
            const { widgets: w } = getDashboardForWorkspace(activeWorkspaceId);
            setWidgets(w);
          }
          if (logs && logs.length > 0) {
            setActivityLogs(logs);
          } else {
            const localLogs = listActivityLogs(activeWorkspaceId, 6);
            setActivityLogs(localLogs);
          }
        } else {
          const { widgets: w } = getDashboardForWorkspace(activeWorkspaceId);
          const logs = listActivityLogs(activeWorkspaceId, 6);
          setWidgets(w);
          setActivityLogs(logs);
        }
      } catch (err) {
        console.error('DashboardView fetch error, using local fallback:', err);
        const { widgets: w } = getDashboardForWorkspace(activeWorkspaceId);
        const logs = listActivityLogs(activeWorkspaceId, 6);
        setWidgets(w);
        setActivityLogs(logs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeWorkspaceId]);

  const statWidgets = widgets.filter((w) => w.type === 'stat');
  const contentWidgets = widgets.filter((w) => w.type !== 'stat');

  return (
    <div className="space-y-8">
      {/* Hero OS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-forma-surface via-forma-card to-forma-surface border border-forma-border relative overflow-hidden shadow-card">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-full bg-forma-limeDim/20 blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-forma-lime uppercase tracking-wider">
              {activeWorkspace?.name || 'FORMA OS'}
            </span>
            <span className="text-forma-subtle">/</span>
            <span className="text-xs text-forma-muted">Live Command Center</span>
            {isSupabaseConfigured && (
              <Badge variant="lime" size="sm" className="font-mono text-[10px] ml-1">☁ Supabase</Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-forma-white tracking-tight">
            Business, your way.
          </h1>
          <p className="text-xs text-forma-muted max-w-xl leading-relaxed">
            Your customized modular business management platform. Total of{' '}
            <strong className="text-forma-white font-mono">{modules.length} active modules</strong>{' '}
            connected and operating in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <Button variant="outline" size="sm" onClick={() => { setMode('builder'); navigate('/app/builder/dashboard'); }} className="text-xs bg-forma-surface/90">
            <Sliders className="w-3.5 h-3.5 text-forma-lime" />
            <span>Customize Dashboard</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setMode('builder'); navigate('/app/builder/modules'); }} className="text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Module</span>
          </Button>
        </div>
      </div>

      {/* Top Stat Counters Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : statWidgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statWidgets.map((w) => <StatWidget key={w.id} widget={w} />)}
        </div>
      )}

      {/* Main Content Widgets Grid */}
      {!isLoading && contentWidgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {contentWidgets.map((w) => {
            const colSpan = w.width >= 8 ? 'lg:col-span-8' : w.width >= 6 ? 'lg:col-span-6' : 'lg:col-span-4';
            return (
              <div key={w.id} className={colSpan}>
                {w.type === 'chart' && <ChartWidget widget={w} />}
                {w.type === 'table' && <TableWidget widget={w} />}
                {w.type === 'recent_records' && <RecentRecordsWidget widget={w} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time System Audit Feed */}
      <div className="forma-card p-5 rounded-xl border border-forma-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-forma-border/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forma-lime" />
            <h3 className="text-xs font-semibold text-forma-white font-display uppercase tracking-wider">
              Live Business Audit Feed
            </h3>
          </div>
          <Badge variant="slate" size="sm" className="font-mono">
            {activityLogs.length} events logged
          </Badge>
        </div>

        <div className="divide-y divide-forma-border/40">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}
            </div>
          ) : activityLogs.length === 0 ? (
            <p className="text-xs text-forma-muted py-4 text-center italic">
              No recent activity recorded yet. Start by adding records to your modules.
            </p>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-forma-lime shrink-0" />
                  <span className="font-semibold text-forma-white shrink-0">{log.user_name}</span>
                  <span className="text-forma-muted">{log.action}</span>
                  <span className="font-medium text-forma-white truncate">{log.entity_name}</span>
                </div>
                <span className="text-[10px] text-forma-subtle font-mono shrink-0">{formatDateTime(log.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
