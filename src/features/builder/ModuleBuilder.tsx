import React, { useState } from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { Module } from '@/types';
import { saveModule, removeModule } from '@/lib/builder-data';
import { slugify } from '@/lib/utils';
import { FieldBuilder } from './FieldBuilder';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { IconRenderer, AVAILABLE_ICONS } from '@/components/ui/IconRenderer';
import {
  Plus,
  Trash2,
  Edit3,
  Sliders,
  Eye,
  Boxes,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ModuleBuilder: React.FC = () => {
  const { modules, activeWorkspaceId, refreshData, setMode } = useWorkspace();
  const navigate = useNavigate();

  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || '');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | undefined>(undefined);

  // Module form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Boxes');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#C7F36B');

  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0];

  const openCreateModal = () => {
    setEditingModule(undefined);
    setName('');
    setIcon('Boxes');
    setDescription('');
    setColor('#C7F36B');
    setIsModuleModalOpen(true);
  };

  const openEditModal = (m: Module) => {
    setEditingModule(m);
    setName(m.name);
    setIcon(m.icon || 'Boxes');
    setDescription(m.description || '');
    setColor(m.color || '#C7F36B');
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!activeWorkspaceId) {
      window.alert('No active business workspace is selected. Create or select a Business OS before adding modules.');
      return;
    }

    const requestedSlug = slugify(name);
    const duplicate = modules.find(
      (module) => module.slug === requestedSlug && module.id !== editingModule?.id
    );
    if (duplicate) {
      window.alert(`A module named “${duplicate.name}” already exists in this business. Choose a different name or edit the existing module.`);
      return;
    }

    try {
      const saved = await saveModule(activeWorkspaceId, {
        name: name.trim(),
        icon,
        description: description.trim(),
        color,
      }, editingModule?.id);
      if (!editingModule) setSelectedModuleId(saved.id);
      await refreshData();
      setIsModuleModalOpen(false);
    } catch (err) {
      console.error('Unable to save module', err);
      const supabaseError = err && typeof err === 'object' ? err as {
        message?: unknown;
        details?: unknown;
        hint?: unknown;
        code?: unknown;
      } : undefined;
      const message = err instanceof Error
        ? err.message
        : typeof supabaseError?.message === 'string'
          ? supabaseError.message
          : 'Unknown error';
      const diagnostic = [supabaseError?.details, supabaseError?.hint, supabaseError?.code]
        .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
        .join(' · ');
      const isDuplicate = /duplicate key|unique constraint|23505/i.test(message);
      window.alert(
        isDuplicate
          ? 'A module with this name already exists in this business. Choose a different name.'
          : `FORMA could not save this module: ${message}${diagnostic ? ` (${diagnostic})` : ''}`
      );
    }
  };

  const handleDeleteModule = async (modId: string) => {
    if (window.confirm('Delete this module and all its fields and records?')) {
      try {
        await removeModule(modId);
        await refreshData();
        const remaining = modules.filter((m) => m.id !== modId);
        if (remaining.length > 0) setSelectedModuleId(remaining[0].id);
      } catch (err) {
        console.error('Unable to delete module', err);
        window.alert('FORMA could not delete this module. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Module List Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-forma-border">
            <h3 className="text-xs font-mono uppercase tracking-wider text-forma-muted">
              Modules ({modules.length})
            </h3>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus className="w-3.5 h-3.5" />
              <span>New Module</span>
            </Button>
          </div>

          <div className="space-y-2">
            {modules.map((m) => {
              const isSelected = activeModule?.id === m.id;
              const fieldCount = m.fields?.length || 0;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModuleId(m.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-forma-card border-forma-lime shadow-lime-sm'
                      : 'bg-forma-surface border-forma-border hover:border-forma-borderHover hover:bg-forma-card/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg bg-forma-surface border border-forma-border flex items-center justify-center text-xs"
                        style={{ color: m.color || '#C7F36B' }}
                      >
                        <IconRenderer name={m.icon || 'Boxes'} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-forma-white font-display">{m.name}</h4>
                        <span className="text-[10px] font-mono text-forma-subtle">slug: {m.slug}</span>
                      </div>
                    </div>

                    <Badge variant="slate" size="sm" className="text-[10px] font-mono">
                      {fieldCount} fields
                    </Badge>
                  </div>

                  {m.description && (
                    <p className="text-[11px] text-forma-muted mt-2 line-clamp-1">{m.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Module Details & Field Builder */}
        <div className="lg:col-span-8 space-y-6">
          {activeModule ? (
            <div className="forma-panel p-6 rounded-2xl border border-forma-border space-y-6">
              {/* Module Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forma-border">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-forma-surface border border-forma-border flex items-center justify-center shadow-sm"
                    style={{ color: activeModule.color || '#C7F36B' }}
                  >
                    <IconRenderer name={activeModule.icon || 'Boxes'} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-forma-white font-display">
                      {activeModule.name} Module
                    </h3>
                    <p className="text-xs text-forma-muted">
                      {activeModule.description || 'Custom business entity'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMode('business');
                      navigate(`/app/modules/${activeModule.id}`);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 text-forma-lime" />
                    <span>View in Business Mode</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(activeModule)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Info</span>
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteModule(activeModule.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Integrated Field Schema Builder */}
              <FieldBuilder module={activeModule} />
            </div>
          ) : (
            <div className="forma-panel p-10 rounded-2xl border border-forma-border text-center">
              <Boxes className="w-10 h-10 text-forma-muted mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-forma-white">No module selected</h3>
              <p className="text-xs text-forma-muted mt-1">
                Select a module on the left or create a new one to begin designing.
              </p>
              <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-4">
                + Create Module
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Module Create/Edit Modal */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title={editingModule ? `Edit Module: ${editingModule.name}` : 'Create New Module'}
        description="A module represents a core business entity (e.g. Customers, Inventory, Bookings)."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveModule} className="space-y-4">
          <Input
            label="Module Name"
            placeholder="e.g. Invoices, Projects, Customers, Inventory"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. People who purchase products and services from us"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Icon Selector from Lucide */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
              Choose Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-2 bg-forma-surface border border-forma-border rounded-lg">
              {AVAILABLE_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-2 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    icon === iconName
                      ? 'bg-forma-lime text-forma-obsidian font-bold shadow-xs'
                      : 'text-forma-muted hover:text-forma-white hover:bg-forma-card'
                  }`}
                  title={iconName}
                >
                  <IconRenderer name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forma-border">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!name.trim()}>
              {editingModule ? 'Save Module' : 'Create Module'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
