import React, { useMemo } from 'react';
import { DashboardWidget } from '@/types';
import { getAllRecordsForModule, getModule } from '@/lib/storage';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatDate } from '@/lib/utils';

export const ChartWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  const { activeWorkspace } = useWorkspace();
  const accentColor = activeWorkspace?.accent_color || '#C7F36B';
  const { title, module_id, config } = widget;
  const mod = module_id ? getModule(module_id) : undefined;

  const chartData = useMemo(() => {
    if (!module_id) {
      // Mock trends data if no module
      return [
        { name: 'Mon', value: 1200 },
        { name: 'Tue', value: 2100 },
        { name: 'Wed', value: 1800 },
        { name: 'Thu', value: 3200 },
        { name: 'Fri', value: 4100 },
        { name: 'Sat', value: 2900 },
        { name: 'Sun', value: 3800 },
      ];
    }

    const records = getAllRecordsForModule(module_id);
    if (records.length === 0) {
      return [
        { name: 'W1', value: 0 },
        { name: 'W2', value: 0 },
        { name: 'W3', value: 0 },
      ];
    }

    return records.slice(0, 7).map((r, i) => {
      const metricVal = config.metric_field ? Number(r.data[config.metric_field]) : (i + 1) * 10;
      const dateLabel = r.data.date || r.data.issue_date || r.data.appointment_time || r.data.shoot_date;
      return {
        name: dateLabel ? formatDate(dateLabel, 'MMM d') : `Item ${i + 1}`,
        value: isNaN(metricVal) ? 10 : metricVal,
      };
    });
  }, [module_id, config]);

  const isBar = config.chart_type === 'bar';

  return (
    <div className="forma-card p-5 rounded-xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-forma-border/50">
        <div>
          <h3 className="text-xs font-semibold text-forma-white font-display uppercase tracking-wider">
            {title}
          </h3>
          {mod && <p className="text-[10px] text-forma-muted mt-0.5">{mod.name} distribution</p>}
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forma-surface text-forma-lime border border-forma-border">
          Live Trend
        </span>
      </div>

      <div className="h-56 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {isBar ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262C35" vertical={false} />
              <XAxis dataKey="name" stroke="#8B9198" fontSize={10} tickLine={false} />
              <YAxis stroke="#8B9198" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161A1F',
                  borderColor: '#262C35',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F5F5F2',
                }}
              />
              <Bar dataKey="value" fill={accentColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262C35" vertical={false} />
              <XAxis dataKey="name" stroke="#8B9198" fontSize={10} tickLine={false} />
              <YAxis stroke="#8B9198" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161A1F',
                  borderColor: '#262C35',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F5F5F2',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#limeGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
