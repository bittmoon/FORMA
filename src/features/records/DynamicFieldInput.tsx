import React from 'react';
import { Field, FormaRecord } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getAllRecordsForModule } from '@/lib/storage';

interface DynamicFieldInputProps {
  field: Field;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export const DynamicFieldInput: React.FC<DynamicFieldInputProps> = ({
  field,
  value,
  onChange,
  error,
}) => {
  const { type, name, config, required } = field;
  const labelWithRequired = `${name}${required ? ' *' : ''}`;

  switch (type) {
    case 'text':
    case 'url':
    case 'file':
    case 'image':
      return (
        <Input
          label={labelWithRequired}
          placeholder={config.placeholder || `Enter ${name.toLowerCase()}`}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case 'email':
      return (
        <Input
          type="email"
          label={labelWithRequired}
          placeholder={config.placeholder || 'user@example.com'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case 'phone':
      return (
        <Input
          type="tel"
          label={labelWithRequired}
          placeholder={config.placeholder || '+1 (555) 000-0000'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          label={labelWithRequired}
          placeholder={config.placeholder || '0'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          error={error}
        />
      );

    case 'currency':
      return (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
            {labelWithRequired}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-forma-lime">
              {config.currency_symbol || '$'}
            </span>
            <input
              type="number"
              step="any"
              placeholder={config.placeholder || '0.00'}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-forma-surface border border-forma-border rounded-lg pl-8 pr-3.5 py-2 text-sm text-forma-white placeholder-forma-subtle focus:outline-none focus:border-forma-lime focus:ring-1 focus:ring-forma-lime font-mono"
            />
          </div>
          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        </div>
      );

    case 'longtext':
      return (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
            {labelWithRequired}
          </label>
          <textarea
            rows={3}
            placeholder={config.placeholder || `Enter ${name.toLowerCase()}...`}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-forma-surface border border-forma-border rounded-lg p-3 text-sm text-forma-white placeholder-forma-subtle focus:outline-none focus:border-forma-lime focus:ring-1 focus:ring-forma-lime resize-y"
          />
          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        </div>
      );

    case 'date':
      return (
        <Input
          type="date"
          label={labelWithRequired}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case 'datetime':
      return (
        <Input
          type="datetime-local"
          label={labelWithRequired}
          value={value ? String(value).slice(0, 16) : ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );

    case 'checkbox':
      return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-forma-surface border border-forma-border">
          <div>
            <span className="text-xs font-semibold text-forma-white">{name}</span>
            {config.description && <p className="text-[11px] text-forma-muted">{config.description}</p>}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              value ? 'bg-forma-lime' : 'bg-forma-card border-forma-border'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-forma-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                value ? 'translate-x-4' : 'translate-x-0 bg-forma-muted'
              }`}
            />
          </button>
        </div>
      );

    case 'select':
      return (
        <Select
          label={labelWithRequired}
          value={value ?? config.default_value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        >
          <option value="" disabled>Select option...</option>
          {(config.options || []).map((opt) => (
            <option key={opt} value={opt} className="bg-forma-card text-forma-white">
              {opt}
            </option>
          ))}
        </Select>
      );

    case 'multiselect':
      const currentValues: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
            {labelWithRequired}
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-forma-surface border border-forma-border min-h-[42px]">
            {(config.options || []).map((opt) => {
              const isSelected = currentValues.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onChange(currentValues.filter((v) => v !== opt));
                    } else {
                      onChange([...currentValues, opt]);
                    }
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-forma-lime text-forma-obsidian font-semibold'
                      : 'bg-forma-card text-forma-muted hover:text-forma-white border border-forma-border'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        </div>
      );

    case 'relation':
      // Lookup available records in target module
      const targetRecords: FormaRecord[] = config.target_module_id
        ? getAllRecordsForModule(config.target_module_id)
        : [];

      return (
        <Select
          label={labelWithRequired}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        >
          <option value="">Select linked record...</option>
          {targetRecords.map((r) => {
            const displayField = config.display_field_slug;
            const primaryLabel =
              (displayField && r.data[displayField]) ||
              r.data.name ||
              r.data.title ||
              r.data.full_name ||
              r.data.company_name ||
              `Record #${r.id.slice(-4)}`;

            return (
              <option key={r.id} value={String(primaryLabel)} className="bg-forma-card text-forma-white">
                {String(primaryLabel)}
              </option>
            );
          })}
        </Select>
      );

    default:
      return (
        <Input
          label={labelWithRequired}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      );
  }
};
