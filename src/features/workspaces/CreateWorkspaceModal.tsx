import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useWorkspace } from './WorkspaceContext';
import { TEMPLATE_PRESETS, BLANK_TEMPLATE } from '@/features/templates/templatePresets';
import { TemplateDefinition } from '@/types';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createNewWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('Freelancer');
  const [teamSize, setTeamSize] = useState('1-5');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(TEMPLATE_PRESETS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createNewWorkspace(name.trim(), businessType, teamSize, selectedTemplate);
      onClose();
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Unable to create workspace', err);
      const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : 'FORMA could not create this business OS. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const templatesList = [...TEMPLATE_PRESETS, BLANK_TEMPLATE];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Business OS"
      description="Deploy a bespoke operating system workspace tailored to your business."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
            <strong className="font-semibold">Couldn’t create this business OS.</strong>{' '}
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Business / Workspace Name"
            placeholder="e.g. Apex Studio, Barber & Co"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Business Type"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            options={[
              { value: 'Freelancer', label: 'Freelancer / Consultant' },
              { value: 'Barber / Salon', label: 'Barber & Salon' },
              { value: 'Photographer', label: 'Photographer / Production' },
              { value: 'Real Estate', label: 'Real Estate Agency' },
              { value: 'Fitness / Gym', label: 'Fitness & Coaching' },
              { value: 'Other', label: 'Other Enterprise' },
            ]}
          />
        </div>

        {/* Template Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
            Choose Operating System Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
            {templatesList.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-forma-elevated border-forma-lime shadow-lime-sm ring-1 ring-forma-lime'
                      : 'bg-forma-surface border-forma-border hover:border-forma-borderHover hover:bg-forma-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-forma-card border border-forma-border flex items-center justify-center text-forma-lime">
                        <IconRenderer name={tpl.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-forma-white font-display">{tpl.name}</h4>
                        <span className="text-[10px] text-forma-muted">{tpl.category}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-forma-lime flex items-center justify-center text-forma-obsidian">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-forma-muted mt-2 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    {tpl.modules.slice(0, 3).map((m) => (
                      <span key={m.slug} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-forma-card text-forma-subtle border border-forma-border/50">
                        {m.name}
                      </span>
                    ))}
                    {tpl.modules.length > 3 && (
                      <span className="text-[9px] font-mono text-forma-subtle">
                        +{tpl.modules.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-forma-border">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} disabled={!name.trim()}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Business OS</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
