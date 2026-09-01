import React, { useState } from 'react';
import { Module, FormaRecord } from '@/types';
import { DynamicFieldInput } from './DynamicFieldInput';
import { Button } from '@/components/ui/Button';

interface RecordFormProps {
  module: Module;
  initialData?: FormaRecord;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  module,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const fields = module.fields || [];

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (initialData) return { ...initialData.data };
    const defaults: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.config.default_value !== undefined) {
        defaults[f.slug] = f.config.default_value;
      }
    });
    return defaults;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const val = formData[f.slug];
      if (f.required) {
        if (val === undefined || val === null || val === '') {
          newErrors[f.slug] = `${f.name} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {fields.length === 0 ? (
          <p className="text-xs text-forma-muted py-4 text-center">
            This module has no fields configured yet. Add fields in Builder Mode.
          </p>
        ) : (
          fields.map((field) => (
            <DynamicFieldInput
              key={field.id}
              field={field}
              value={formData[field.slug]}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, [field.slug]: val }));
                if (errors[field.slug]) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[field.slug];
                    return copy;
                  });
                }
              }}
              error={errors[field.slug]}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-forma-border">
        <Button type="button" variant="outline" size="md" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" isLoading={isLoading} disabled={fields.length === 0}>
          {initialData ? 'Save Changes' : `Create ${module.name.slice(0, -1) || module.name}`}
        </Button>
      </div>
    </form>
  );
};
