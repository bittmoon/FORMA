import React, { useState, useEffect, useCallback } from 'react';
import { Module, FormaRecord } from '@/types';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { useAuth } from '@/features/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  sbListRecords,
  sbCreateRecord,
  sbUpdateRecord,
  sbDeleteRecord,
  sbLogActivity,
} from '@/lib/supabase-db';
import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RecordModal } from './RecordModal';
import { RecordDetailDrawer } from './RecordDetailDrawer';
import { formatCurrency, formatDate, truncate } from '@/lib/utils';
import {
  Plus,
  Search,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecordListView: React.FC<{ module: Module }> = ({ module }) => {
  const { activeWorkspaceId, setMode } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Data state
  const [records, setRecords] = useState<FormaRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(true);

  // Modal & Drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FormaRecord | undefined>(undefined);
  const [drawerRecord, setDrawerRecord] = useState<FormaRecord | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsFetching(true);
    try {
      if (isSupabaseConfigured) {
        const result = await sbListRecords(module.id, {
          search,
          sortBy,
          sortOrder,
          filters,
          page,
          pageSize,
        });
        if (result.records.length > 0 || (result.totalCount > 0 && !search && Object.keys(filters).length === 0)) {
          setRecords(result.records);
          setTotalCount(result.totalCount);
          setTotalPages(result.totalPages);
        } else {
          const localRes = listRecords(module.id, { search, sortBy, sortOrder, filters, page, pageSize });
          setRecords(localRes.records);
          setTotalCount(localRes.totalCount);
          setTotalPages(localRes.totalPages);
        }
      } else {
        // Local storage (synchronous)
        const result = listRecords(module.id, { search, sortBy, sortOrder, filters, page, pageSize });
        setRecords(result.records);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      console.error('fetchRecords error, using local storage:', err);
      const localRes = listRecords(module.id, { search, sortBy, sortOrder, filters, page, pageSize });
      setRecords(localRes.records);
      setTotalCount(localRes.totalCount);
      setTotalPages(localRes.totalPages);
    } finally {
      setIsFetching(false);
    }
  }, [module.id, search, sortBy, sortOrder, filters, page, pageSize]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const fields = module.fields || [];
  const filterableFields = fields.filter((f) => f.type === 'select' || f.type === 'checkbox');

  const handleSort = (fieldSlug: string) => {
    if (sortBy === fieldSlug) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(fieldSlug);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleSaveRecord = async (data: Record<string, any>) => {
    try {
      if (isSupabaseConfigured) {
        if (editingRecord) {
          await sbUpdateRecord(editingRecord.id, data);
          await sbLogActivity(activeWorkspaceId, user?.name || 'User', 'updated record in', module.name, data[fields[0]?.slug] || editingRecord.id);
        } else {
          await sbCreateRecord(module.id, activeWorkspaceId, user?.id || '', data);
          await sbLogActivity(activeWorkspaceId, user?.name || 'User', 'created record in', module.name, data[fields[0]?.slug] || 'New Record');
        }
      } else {
        if (editingRecord) {
          updateRecord(editingRecord.id, data);
        } else {
          createRecord(module.id, activeWorkspaceId, data);
        }
      }
    } catch (err) {
      console.error('handleSaveRecord error:', err);
    }
    setIsModalOpen(false);
    setEditingRecord(undefined);
    fetchRecords();
  };

  const handleDelete = async (recordId: string) => {
    try {
      if (isSupabaseConfigured) {
        await sbDeleteRecord(recordId);
        await sbLogActivity(activeWorkspaceId, user?.name || 'User', 'deleted record from', module.name, recordId);
      } else {
        deleteRecord(recordId);
      }
    } catch (err) {
      console.error('handleDelete error:', err);
    }
    if (drawerRecord?.id === recordId) setDrawerRecord(null);
    fetchRecords();
  };

  const renderCellContent = (field: (typeof fields)[0], val: any) => {
    if (val === undefined || val === null || val === '') {
      return <span className="text-forma-subtle">—</span>;
    }
    switch (field.type) {
      case 'currency':
        return (
          <span className="font-mono text-forma-lime font-medium">
            {formatCurrency(val, field.config.currency_symbol || '$')}
          </span>
        );
      case 'checkbox':
        return <Badge variant={val ? 'lime' : 'slate'} size="sm">{val ? 'Yes' : 'No'}</Badge>;
      case 'select':
        return (
          <Badge variant="slate" size="sm" className="bg-forma-elevated text-forma-white border-forma-border">
            {String(val)}
          </Badge>
        );
      case 'multiselect':
        if (!Array.isArray(val)) return <span>{String(val)}</span>;
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {val.map((item) => <Badge key={item} variant="lime" size="sm">{item}</Badge>)}
          </div>
        );
      case 'date':
      case 'datetime':
        return <span className="font-mono text-xs text-forma-muted">{formatDate(val)}</span>;
      case 'relation':
        return <Badge variant="sky" size="sm">{String(val)}</Badge>;
      case 'url':
        return (
          <a href={val} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="text-sky-400 hover:underline truncate max-w-[140px] block">
            {truncate(val, 25)}
          </a>
        );
      default:
        return <span className="text-forma-white truncate block max-w-[200px]">{truncate(String(val), 35)}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forma-border">
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl bg-forma-card border border-forma-border flex items-center justify-center text-forma-lime shadow-sm"
            style={{ borderColor: module.color ? `${module.color}40` : undefined }}
          >
            <IconRenderer name={module.icon || 'Boxes'} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-display text-forma-white tracking-tight">{module.name}</h1>
              <Badge variant="slate" size="sm" className="font-mono">{totalCount} {totalCount === 1 ? 'record' : 'records'}</Badge>
              {isSupabaseConfigured && (
                <Badge variant="lime" size="sm" className="font-mono text-[10px]">☁ Live</Badge>
              )}
            </div>
            {module.description && <p className="text-xs text-forma-muted mt-0.5">{module.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRecords}
            title="Refresh"
            className="p-1.5 rounded-lg text-forma-muted hover:text-forma-white hover:bg-forma-card border border-transparent hover:border-forma-border transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <Button variant="outline" size="sm" onClick={() => { setMode('builder'); navigate('/app/builder/modules'); }} className="text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-forma-muted" />
            <span>Configure Schema</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setEditingRecord(undefined); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            <span>New {module.name.replace(/s$/, '') || module.name}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forma-muted pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${module.name.toLowerCase()}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-forma-surface border border-forma-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-forma-white placeholder-forma-subtle focus:outline-none focus:border-forma-lime focus:ring-1 focus:ring-forma-lime"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filterableFields.map((f) => (
            <div key={f.id}>
              {f.type === 'select' && f.config.options && (
                <select
                  value={filters[f.slug] || ''}
                  onChange={(e) => { const val = e.target.value; setFilters((prev) => ({ ...prev, [f.slug]: val })); setPage(1); }}
                  className="appearance-none bg-forma-surface border border-forma-border rounded-lg px-2.5 py-1.5 pr-7 text-xs text-forma-muted hover:text-forma-white focus:outline-none focus:border-forma-lime cursor-pointer"
                >
                  <option value="">All {f.name}</option>
                  {f.config.options.map((opt) => (
                    <option key={opt} value={opt} className="bg-forma-card text-forma-white">{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
          {(search || Object.values(filters).some(Boolean)) && (
            <button onClick={() => { setSearch(''); setFilters({}); setPage(1); }} className="text-xs text-forma-lime hover:underline px-2 py-1 cursor-pointer">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Data Table */}
      {isFetching ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={module.icon || 'Boxes'}
          title={`No ${module.name.toLowerCase()} yet`}
          description={`Create your first ${module.name.toLowerCase().replace(/s$/, '') || module.name.toLowerCase()} to start building your business database.`}
          actionLabel={`+ Add ${module.name.replace(/s$/, '') || module.name}`}
          onAction={() => { setEditingRecord(undefined); setIsModalOpen(true); }}
        />
      ) : (
        <div className="border border-forma-border rounded-xl bg-forma-surface/30 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-forma-white border-collapse">
              <thead>
                <tr className="bg-forma-card border-b border-forma-border select-none">
                  {fields.map((field) => (
                    <th key={field.id} onClick={() => handleSort(field.slug)}
                      className="px-4 py-3 font-semibold text-forma-muted hover:text-forma-white tracking-wider uppercase text-[11px] cursor-pointer transition-colors">
                      <div className="flex items-center gap-1.5">
                        <span>{field.name}</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortBy === field.slug ? 'text-forma-lime' : 'text-forma-subtle'}`} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-forma-muted uppercase text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forma-border/50">
                {records.map((record) => (
                  <tr key={record.id} onClick={() => setDrawerRecord(record)}
                    className="hover:bg-forma-card/60 transition-colors cursor-pointer group">
                    {fields.map((field) => (
                      <td key={field.id} className="px-4 py-3.5 align-middle">
                        {renderCellContent(field, record.data[field.slug])}
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDrawerRecord(record)} title="View details"
                          className="p-1 rounded text-forma-muted hover:text-forma-white hover:bg-forma-surface transition-colors cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingRecord(record); setIsModalOpen(true); }} title="Edit record"
                          className="p-1 rounded text-forma-muted hover:text-forma-lime hover:bg-forma-surface transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this record?')) handleDelete(record.id); }} title="Delete record"
                          className="p-1 rounded text-forma-muted hover:text-red-400 hover:bg-forma-surface transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-forma-card/60 border-t border-forma-border flex items-center justify-between">
            <span className="text-[11px] text-forma-muted font-mono">
              Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="w-3.5 h-3.5" /><span>Prev</span>
              </Button>
              <span className="text-xs text-forma-white font-mono px-2">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <span>Next</span><ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Create/Edit Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRecord(undefined); }}
        module={module}
        record={editingRecord}
        onSubmit={handleSaveRecord}
      />

      {/* Record Inspect Drawer */}
      <RecordDetailDrawer
        isOpen={Boolean(drawerRecord)}
        onClose={() => setDrawerRecord(null)}
        module={module}
        record={drawerRecord}
        onEdit={(rec) => { setEditingRecord(rec); setIsModalOpen(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
};
