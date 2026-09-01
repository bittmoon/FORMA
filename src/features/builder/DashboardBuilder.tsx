import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import {
  getBuilderDashboard,
  createBuilderWidget,
  removeBuilderWidget,
  updateBuilderWidget,
} from '@/lib/builder-data';
import { Dashboard, DashboardWidget, WidgetType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { IconRenderer } from '@/components/ui/IconRenderer';
import {
  Plus,
  Trash2,
  LayoutDashboard,
  BarChart3,
  Table,
  TrendingUp,
  Clock,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardBuilder: React.FC = () => {
  const { activeWorkspaceId, modules, setMode } = useWorkspace();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Widget form
  const [title, setTitle] = useState('');
  const [widgetType, setWidgetType] = useState<WidgetType>('stat');
  const [moduleId, setModuleId] = useState(modules[0]?.id || '');
  const [aggregate, setAggregate] = useState<'count' | 'sum' | 'avg'>('count');
  const [metricField, setMetricField] = useState('');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [width, setWidth] = useState(4);
  const [subtitle, setSubtitle] = useState('');

  const loadDashboard = async () => {
    if (!activeWorkspaceId) return;
    try {
      const result = await getBuilderDashboard(activeWorkspaceId);
      setDashboard(result.dashboard);
      setWidgets(result.widgets);
    } catch (err) {
      console.error('Unable to load dashboard', err);
    }
  };

  useEffect(() => { loadDashboard(); }, [activeWorkspaceId]);

  const selectedModule = modules.find((m) => m.id === moduleId);
  const numericFields = (selectedModule?.fields || []).filter(
    (f) => f.type === 'currency' || f.type === 'number'
  );

  const openAddModal = () => {
    setTitle('');
    setWidgetType('stat');
    setModuleId(modules[0]?.id || '');
    setAggregate('count');
    setMetricField(numericFields[0]?.slug || '');
    setChartType('area');
    setWidth(4);
    setSubtitle('');
    setIsModalOpen(true);
  };

  const handleCreateWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dashboard) return;

    try {
      await createBuilderWidget(dashboard.id, {
      title: title.trim(),
      type: widgetType,
      module_id: moduleId || undefined,
      config: {
        aggregate: widgetType === 'stat' ? aggregate : undefined,
        metric_field: metricField || undefined,
        chart_type: widgetType === 'chart' ? chartType : undefined,
        subtitle: subtitle.trim() || undefined,
        limit: 5,
      },
      position_x: 0,
      position_y: 0,
      width: Number(width),
      height: 4,
      });
      await loadDashboard();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Unable to create widget', err);
      window.alert('FORMA could not save this widget. Please try again.');
    }
  };

  const handleDeleteWidget = async (wId: string) => {
    if (window.confirm('Remove this widget from the dashboard?')) {
      try {
        await removeBuilderWidget(wId);
        await loadDashboard();
      } catch (err) {
        console.error('Unable to delete widget', err);
        window.alert('FORMA could not delete this widget. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forma-border">
        <div>
          <h3 className="text-base font-bold font-display text-forma-white">
            Dashboard Widget Configurator
          </h3>
          <p className="text-xs text-forma-muted mt-0.5">
            Add metrics, trends, and dynamic tables to your business Command Center.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMode('business');
              navigate('/app/dashboard');
            }}
          >
            <Eye className="w-3.5 h-3.5 text-forma-lime" />
            <span>Preview Live Dashboard</span>
          </Button>

          <Button variant="primary" size="sm" onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            <span>Add Widget</span>
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => {
          const mod = modules.find((m) => m.id === w.module_id);
          return (
            <div
              key={w.id}
              className="forma-card p-4 rounded-xl border border-forma-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-forma-surface border border-forma-border flex items-center justify-center text-forma-lime text-xs">
                      {w.type === 'stat' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : w.type === 'chart' ? (
                        <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                      ) : w.type === 'table' ? (
                        <Table className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-forma-white">{w.title}</h4>
                      <span className="text-[10px] font-mono text-forma-subtle">
                        {w.type.toUpperCase()} · {w.width} cols
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteWidget(w.id)}
                    className="p-1 rounded text-forma-muted hover:text-red-400 hover:bg-forma-surface transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 text-xs text-forma-muted space-y-1">
                  {mod && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Source Module:</span>
                      <Badge variant="slate" size="sm">{mod.name}</Badge>
                    </div>
                  )}
                  {w.config.aggregate && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Calculation:</span>
                      <span className="font-mono text-forma-lime uppercase">{w.config.aggregate}</span>
                    </div>
                  )}
                  {w.config.metric_field && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Field:</span>
                      <span className="font-mono text-forma-white">{w.config.metric_field}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-forma-border/50 flex items-center justify-between">
                <span className="text-[10px] text-forma-subtle">Width Span:</span>
                <select
                  value={w.width}
                  onChange={async (e) => {
                    try {
                      await updateBuilderWidget(w.id, { width: Number(e.target.value) });
                      await loadDashboard();
                    } catch (err) {
                      console.error('Unable to resize widget', err);
                      window.alert('FORMA could not resize this widget. Please try again.');
                    }
                  }}
                  className="bg-forma-surface text-forma-white text-[11px] px-2 py-0.5 rounded border border-forma-border cursor-pointer focus:outline-none"
                >
                  <option value={3}>1/4 width (3 cols)</option>
                  <option value={4}>1/3 width (4 cols)</option>
                  <option value={6}>1/2 width (6 cols)</option>
                  <option value={8}>2/3 width (8 cols)</option>
                  <option value={12}>Full width (12 cols)</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Widget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Dashboard Widget"
        description="Configure a new analytical block for your command center."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateWidget} className="space-y-4">
          <Input
            label="Widget Title"
            placeholder="e.g. Total Revenue, Active Projects, Recent Sales"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Widget Type"
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value as WidgetType)}
              options={[
                { value: 'stat', label: 'Metric Stat Counter' },
                { value: 'chart', label: 'Trend Chart' },
                { value: 'table', label: 'Data Table' },
                { value: 'recent_records', label: 'Recent Records Feed' },
              ]}
            />

            <Select
              label="Data Source Module"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              required
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id} className="bg-forma-card text-forma-white">
                  {m.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Conditional Stat Config */}
          {widgetType === 'stat' && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Aggregation"
                value={aggregate}
                onChange={(e) => setAggregate(e.target.value as any)}
                options={[
                  { value: 'count', label: 'Count of Records' },
                  { value: 'sum', label: 'Sum of Values' },
                  { value: 'avg', label: 'Average Value' },
                ]}
              />

              {(aggregate === 'sum' || aggregate === 'avg') && (
                <Select
                  label="Target Numeric Field"
                  value={metricField}
                  onChange={(e) => setMetricField(e.target.value)}
                  required
                >
                  <option value="">Select field...</option>
                  {numericFields.map((f) => (
                    <option key={f.id} value={f.slug} className="bg-forma-card text-forma-white">
                      {f.name} ({f.type})
                    </option>
                  ))}
                </Select>
              )}
            </div>
          )}

          {/* Conditional Chart Config */}
          {widgetType === 'chart' && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Chart Style"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                options={[
                  { value: 'area', label: 'Smooth Gradient Area' },
                  { value: 'bar', label: 'Vertical Bar Chart' },
                ]}
              />

              <Select
                label="Metric Field"
                value={metricField}
                onChange={(e) => setMetricField(e.target.value)}
              >
                <option value="">Default Record Counts</option>
                {numericFields.map((f) => (
                  <option key={f.id} value={f.slug} className="bg-forma-card text-forma-white">
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Column Width"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              options={[
                { value: '3', label: '1/4 width (3 cols)' },
                { value: '4', label: '1/3 width (4 cols)' },
                { value: '6', label: '1/2 width (6 cols)' },
                { value: '8', label: '2/3 width (8 cols)' },
                { value: '12', label: 'Full width (12 cols)' },
              ]}
            />

            <Input
              label="Subtitle Note (Optional)"
              placeholder="e.g. Month-to-date"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forma-border">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!title.trim()}>
              Save Widget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
