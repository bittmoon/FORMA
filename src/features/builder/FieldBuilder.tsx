import React, { useState } from 'react';
import { Module, Field, FieldType } from '@/types';
import { saveField, removeField, reorderBuilderFields } from '@/lib/builder-data';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  HelpCircle,
  Hash,
} from 'lucide-react';

interface FieldBuilderProps {
  module: Module;
}

const FIELD_TYPE_LABELS: { type: FieldType; label: string; desc: string }[] = [
  { type: 'text', label: 'Text', desc: 'Short text for names, titles, codes' },
  { type: 'longtext', label: 'Long Text', desc: 'Multi-line notes and descriptions' },
  { type: 'currency', label: 'Currency ($)', desc: 'Prices, revenues, and totals' },
  { type: 'number', label: 'Number', desc: 'Quantities, hours, percentages' },
  { type: 'select', label: 'Select', desc: 'Single choice from custom options' },
  { type: 'multiselect', label: 'Multi-Select', desc: 'Multiple tags or categories' },
  { type: 'checkbox', label: 'Checkbox', desc: 'Yes/No binary boolean' },
  { type: 'date', label: 'Date', desc: 'Calendar date (YYYY-MM-DD)' },
  { type: 'datetime', label: 'Date & Time', desc: 'Timestamp with time' },
  { type: 'email', label: 'Email', desc: 'Email address with mailto links' },
  { type: 'phone', label: 'Phone', desc: 'Phone number format' },
  { type: 'relation', label: 'Relation Link', desc: 'Link to another business module' },
  { type: 'url', label: 'URL Link', desc: 'Web links and repositories' },
  { type: 'file', label: 'File Attachment', desc: 'Document or PDF link' },
  { type: 'image', label: 'Image URL', desc: 'Photo or avatar asset' },
];

export const FieldBuilder: React.FC<FieldBuilderProps> = ({ module }) => {
  const { modules, refreshData } = useWorkspace();
  const fields = module.fields || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | undefined>(undefined);

  // Form State
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [optionsText, setOptionsText] = useState(''); // Comma or newline separated for select
  const [targetModuleId, setTargetModuleId] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const otherModules = modules.filter((m) => m.id !== module.id);

  const openCreateModal = () => {
    setEditingField(undefined);
    setFieldName('');
    setFieldType('text');
    setIsRequired(false);
    setPlaceholder('');
    setOptionsText('');
    setTargetModuleId(otherModules[0]?.id || '');
    setCurrencySymbol('$');
    setIsModalOpen(true);
  };

  const openEditModal = (f: Field) => {
    setEditingField(f);
    setFieldName(f.name);
    setFieldType(f.type);
    setIsRequired(f.required);
    setPlaceholder(f.config.placeholder || '');
    setOptionsText((f.config.options || []).join(', '));
    setTargetModuleId(f.config.target_module_id || otherModules[0]?.id || '');
    setCurrencySymbol(f.config.currency_symbol || '$');
    setIsModalOpen(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    const parsedOptions =
      fieldType === 'select' || fieldType === 'multiselect'
        ? optionsText
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const config = {
      placeholder: placeholder.trim() || undefined,
      options: parsedOptions,
      target_module_id: fieldType === 'relation' ? targetModuleId : undefined,
      currency_symbol: fieldType === 'currency' ? currencySymbol : undefined,
    };

    try {
      await saveField(module.id, {
        name: fieldName.trim(),
        type: fieldType,
        required: isRequired,
        config,
      }, fields.length, editingField?.id);
      await refreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Unable to save field', err);
      window.alert('FORMA could not save this field. Please try again.');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await removeField(fieldId);
        await refreshData();
      } catch (err) {
        console.error('Unable to delete field', err);
        window.alert('FORMA could not delete this field. Please try again.');
      }
    }
  };

  const moveField = async (idx: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newFields.length) return;

    const temp = newFields[idx];
    newFields[idx] = newFields[targetIdx];
    newFields[targetIdx] = temp;

    try {
      await reorderBuilderFields(module.id, newFields.map((f) => f.id));
      await refreshData();
    } catch (err) {
      console.error('Unable to reorder fields', err);
      window.alert('FORMA could not reorder fields. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-forma-muted">
            Configured Fields ({fields.length})
          </h4>
          <p className="text-[11px] text-forma-subtle">
            Fields define the dynamic schema attributes for {module.name}.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-3.5 h-3.5" />
          <span>Add Field</span>
        </Button>
      </div>

      {/* Field List */}
      <div className="divide-y divide-forma-border border border-forma-border rounded-xl bg-forma-surface/30 overflow-hidden">
        {fields.length === 0 ? (
          <div className="p-6 text-center text-xs text-forma-muted italic">
            No fields configured yet. Click "+ Add Field" to create your first attribute.
          </div>
        ) : (
          fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-forma-card/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveField(idx, 'up')}
                    className="p-0.5 text-forma-subtle hover:text-forma-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === fields.length - 1}
                    onClick={() => moveField(idx, 'down')}
                    className="p-0.5 text-forma-subtle hover:text-forma-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-forma-white">{field.name}</span>
                    {field.required && (
                      <span className="text-[10px] text-red-400 font-mono">*required</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-forma-muted">
                    slug: {field.slug}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="slate" size="sm" className="font-mono text-[10px]">
                  {field.type}
                </Badge>

                {field.type === 'relation' && field.config.target_module_id && (
                  <Badge variant="sky" size="sm" className="text-[10px]">
                    → {modules.find((m) => m.id === field.config.target_module_id)?.name || 'Linked Module'}
                  </Badge>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(field)}
                    className="p-1 rounded text-forma-muted hover:text-forma-lime hover:bg-forma-surface transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="p-1 rounded text-forma-muted hover:text-red-400 hover:bg-forma-surface transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Field Configuration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? `Edit Field: ${editingField.name}` : `Add Field to ${module.name}`}
        description="Choose the field type and customize validation rules."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveField} className="space-y-4">
          <Input
            label="Field Label"
            placeholder="e.g. Total Revenue, Client Phone, VIP Status"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
              Field Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {FIELD_TYPE_LABELS.map((item) => {
                const isSelected = fieldType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setFieldType(item.type)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-forma-elevated border-forma-lime ring-1 ring-forma-lime'
                        : 'bg-forma-surface border-forma-border hover:border-forma-borderHover'
                    }`}
                  >
                    <div className="text-xs font-semibold text-forma-white">{item.label}</div>
                    <div className="text-[10px] text-forma-muted leading-tight mt-0.5 line-clamp-1">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conditional Config for Select / Multi-Select */}
          {(fieldType === 'select' || fieldType === 'multiselect') && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
                Options (Comma separated)
              </label>
              <textarea
                rows={2}
                placeholder="Active, Pending, Completed, Cancelled"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                className="w-full bg-forma-surface border border-forma-border rounded-lg p-2.5 text-xs text-forma-white placeholder-forma-subtle focus:outline-none focus:border-forma-lime"
              />
            </div>
          )}

          {/* Conditional Config for Currency */}
          {fieldType === 'currency' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Currency Symbol"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="$"
              />
              <Input
                label="Placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          {/* Conditional Config for Relation */}
          {fieldType === 'relation' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
                Link to Target Module
              </label>
              <Select
                value={targetModuleId}
                onChange={(e) => setTargetModuleId(e.target.value)}
                required
              >
                <option value="" disabled>Select target module...</option>
                {otherModules.map((m) => (
                  <option key={m.id} value={m.id} className="bg-forma-card text-forma-white">
                    {m.name} ({m.slug})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Required checkbox */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-forma-surface border border-forma-border">
            <div>
              <span className="text-xs font-semibold text-forma-white">Required Field</span>
              <p className="text-[11px] text-forma-muted">Records cannot be saved without filling this field</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isRequired}
              onClick={() => setIsRequired(!isRequired)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                isRequired ? 'bg-forma-lime' : 'bg-forma-card border-forma-border'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-forma-obsidian shadow-lg transition duration-200 ${
                  isRequired ? 'translate-x-4' : 'translate-x-0 bg-forma-muted'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forma-border">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!fieldName.trim()}>
              {editingField ? 'Save Field' : 'Create Field'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
