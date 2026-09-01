import React from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Module, FormaRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Edit2, Trash2, Calendar, Clock, Hash } from 'lucide-react';

interface RecordDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  record: FormaRecord | null;
  onEdit: (record: FormaRecord) => void;
  onDelete: (recordId: string) => void;
}

export const RecordDetailDrawer: React.FC<RecordDetailDrawerProps> = ({
  isOpen,
  onClose,
  module,
  record,
  onEdit,
  onDelete,
}) => {
  if (!record) return null;

  const fields = module.fields || [];
  const primaryName =
    record.data.name ||
    record.data.title ||
    record.data.full_name ||
    record.data.company_name ||
    record.data.invoice_no ||
    `Record #${record.id.slice(-4)}`;

  const renderFieldValue = (field: (typeof fields)[0], val: any) => {
    if (val === undefined || val === null || val === '') {
      return <span className="text-forma-subtle italic text-xs">Empty</span>;
    }

    switch (field.type) {
      case 'currency':
        return (
          <span className="text-sm font-semibold font-mono text-forma-lime">
            {formatCurrency(val, field.config.currency_symbol || '$')}
          </span>
        );

      case 'checkbox':
        return (
          <Badge variant={val ? 'lime' : 'slate'} size="sm">
            {val ? 'Yes' : 'No'}
          </Badge>
        );

      case 'date':
        return <span className="text-xs text-forma-white font-mono">{formatDate(val)}</span>;

      case 'datetime':
        return <span className="text-xs text-forma-white font-mono">{formatDateTime(val)}</span>;

      case 'select':
        return (
          <Badge variant="slate" size="sm" className="bg-forma-elevated text-forma-white border-forma-border">
            {String(val)}
          </Badge>
        );

      case 'multiselect':
        if (!Array.isArray(val)) return <span>{String(val)}</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {val.map((item) => (
              <Badge key={item} variant="lime" size="sm">
                {item}
              </Badge>
            ))}
          </div>
        );

      case 'relation':
        return (
          <Badge variant="sky" size="sm">
            {String(val)}
          </Badge>
        );

      case 'url':
        return (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:underline truncate block"
          >
            {val}
          </a>
        );

      default:
        return <span className="text-xs text-forma-white leading-relaxed">{String(val)}</span>;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={String(primaryName)}
      subtitle={`${module.name} Record details`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-forma-surface border border-forma-border">
          <div className="flex items-center gap-1.5 text-xs text-forma-muted font-mono">
            <Hash className="w-3.5 h-3.5" />
            <span>ID: {record.id.slice(-8)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this record?')) {
                  onDelete(record.id);
                  onClose();
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Fields Attribute Grid */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-forma-muted">
            Properties & Attributes
          </div>

          <div className="divide-y divide-forma-border/50 border border-forma-border rounded-xl bg-forma-surface/40 overflow-hidden">
            {fields.map((field) => (
              <div key={field.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-forma-card/50 transition-colors">
                <div className="w-36 shrink-0">
                  <span className="text-xs font-medium text-forma-muted">{field.name}</span>
                </div>
                <div className="flex-1 text-left sm:text-right">
                  {renderFieldValue(field, record.data[field.slug])}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Metadata */}
        <div className="p-4 rounded-xl bg-forma-surface/20 border border-forma-border/50 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-forma-subtle">
            System Metadata
          </div>
          <div className="flex items-center justify-between text-xs text-forma-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Created
            </span>
            <span className="font-mono text-forma-white">{formatDateTime(record.created_at)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-forma-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Updated
            </span>
            <span className="font-mono text-forma-white">{formatDateTime(record.updated_at)}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
