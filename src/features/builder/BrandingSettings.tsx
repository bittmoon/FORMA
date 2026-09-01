import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Check, Sparkles, Palette } from 'lucide-react';
import { applyWorkspaceAccentColor } from '@/lib/utils';

const ACCENT_COLORS = [
  { label: 'Forma Lime', hex: '#C7F36B' },
  { label: 'Sky Blue', hex: '#38BDF8' },
  { label: 'Emerald Green', hex: '#10B981' },
  { label: 'Amber Gold', hex: '#F59E0B' },
  { label: 'Rose Pink', hex: '#F43F5E' },
  { label: 'Indigo Violet', hex: '#6366F1' },
];

export const BrandingSettings: React.FC = () => {
  const { activeWorkspace, updateActiveWorkspace } = useWorkspace();

  const [name, setName] = useState(activeWorkspace?.name || '');
  const [businessType, setBusinessType] = useState(activeWorkspace?.business_type || 'Freelancer');
  const [currency, setCurrency] = useState(activeWorkspace?.currency || '$');
  const [timezone, setTimezone] = useState(activeWorkspace?.timezone || 'UTC-5');
  const [accentColor, setAccentColor] = useState(activeWorkspace?.accent_color || '#C7F36B');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name || '');
      setBusinessType(activeWorkspace.business_type || 'Freelancer');
      setCurrency(activeWorkspace.currency || '$');
      setTimezone(activeWorkspace.timezone || 'UTC-5');
      setAccentColor(activeWorkspace.accent_color || '#C7F36B');
    }
  }, [activeWorkspace]);

  const handleColorSelect = (hex: string) => {
    setAccentColor(hex);
    applyWorkspaceAccentColor(hex);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateActiveWorkspace({
      name: name.trim(),
      business_type: businessType,
      currency,
      timezone,
      accent_color: accentColor,
    });
    applyWorkspaceAccentColor(accentColor);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="pb-5 border-b border-forma-border">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-forma-lime" />
          <h3 className="text-base font-bold font-display text-forma-white">
            Workspace Branding & Identity
          </h3>
        </div>
        <p className="text-xs text-forma-muted mt-1">
          Customize the visual brand accent color, currency, and business profile for this workspace.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Input
          label="Business / Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Business Type"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            options={[
              { value: 'Freelancer', label: 'Freelancer / Consultant' },
              { value: 'Studio / Agency', label: 'Creative Studio / Agency' },
              { value: 'Barber / Salon', label: 'Barber & Salon' },
              { value: 'Photographer', label: 'Photographer / Production' },
              { value: 'Real Estate', label: 'Real Estate Agency' },
              { value: 'Fitness / Gym', label: 'Fitness & Coaching' },
              { value: 'Other', label: 'Other Enterprise' },
            ]}
          />

          <Select
            label="Default Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: '$', label: 'USD ($)' },
              { value: '€', label: 'EUR (€)' },
              { value: '£', label: 'GBP (£)' },
              { value: 'CAD $', label: 'CAD ($)' },
              { value: 'AUD $', label: 'AUD ($)' },
              { value: 'AED', label: 'AED (د.إ)' },
            ]}
          />
        </div>

        {/* Accent Color Picker with Live Swatches & Custom Picker */}
        <div className="space-y-3 p-4 rounded-xl bg-forma-surface/60 border border-forma-border">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-forma-white">
                Brand Accent Color
              </label>
              <span className="text-[11px] text-forma-muted">
                Instantly updates buttons, active tabs, highlights, and charts across your entire workspace.
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-forma-white bg-forma-card px-2.5 py-1 rounded-lg border border-forma-border">
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                style={{ backgroundColor: accentColor }}
              />
              <span>{accentColor}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
            {ACCENT_COLORS.map((c) => {
              const isSelected = accentColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => handleColorSelect(c.hex)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-forma-card border-forma-lime ring-2 ring-forma-lime shadow-lime-sm scale-105'
                      : 'bg-forma-surface border-forma-border hover:border-forma-borderHover hover:scale-[1.02]'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-black/30 shadow-inner flex items-center justify-center text-forma-obsidian"
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <span className="text-[10px] text-forma-white font-medium text-center leading-tight">
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Hex input */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-forma-muted">Custom Hex:</span>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-8 h-8 rounded-lg bg-transparent border border-forma-border cursor-pointer p-0.5"
              title="Pick custom color"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              placeholder="#C7F36B"
              className="w-28 bg-forma-card border border-forma-border rounded-lg px-2.5 py-1 text-xs text-forma-white font-mono uppercase focus:outline-none focus:border-forma-lime focus:ring-1 focus:ring-forma-lime"
            />
          </div>
        </div>

        {/* Live UI Preview Card */}
        <div className="p-4 rounded-xl bg-forma-card/80 border border-forma-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-forma-border/50">
            <span className="text-[11px] font-mono text-forma-muted uppercase tracking-wider">
              Live Theme Preview
            </span>
            <Badge variant="lime" size="sm">
              <Sparkles className="w-3 h-3" />
              <span>Theme Applied</span>
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="primary" size="sm">
              Primary Action
            </Button>
            <Button type="button" variant="outline" size="sm" className="text-forma-lime border-forma-lime/30">
              Outlined Accent
            </Button>
            <span className="text-xs font-mono text-forma-lime font-bold">
              $18,450.00
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" size="md">
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Branding Saved & Applied!</span>
              </>
            ) : (
              <span>Save Workspace Branding</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

