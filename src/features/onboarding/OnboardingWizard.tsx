import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { TEMPLATE_PRESETS, BLANK_TEMPLATE } from '@/features/templates/templatePresets';
import { TemplateDefinition } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Boxes,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { createNewWorkspace } = useWorkspace();

  const [step, setStep] = useState(1);

  // Step 1: Business info
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Barber / Salon');
  const [teamSize, setTeamSize] = useState('1-5');

  // Step 2: Management Focus
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    'Customers',
    'Appointments',
    'Payments',
  ]);

  // Step 3: Template Presets
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(TEMPLATE_PRESETS[1]); // Default Barber/Salon

  // Step 4: Generating state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const businessTypes = [
    { id: 'Freelancer', label: 'Freelancer / Consultant', icon: 'Briefcase' },
    { id: 'Barber / Salon', label: 'Barber & Salon Studio', icon: 'Scissors' },
    { id: 'Photographer', label: 'Photographer / Production', icon: 'Camera' },
    { id: 'Real Estate', label: 'Real Estate Brokerage', icon: 'Building2' },
    { id: 'Fitness / Gym', label: 'Fitness & Health Studio', icon: 'HeartPulse' },
    { id: 'Other', label: 'Custom Enterprise', icon: 'Boxes' },
  ];

  const focusOptions = [
    { id: 'Customers', label: 'Customers / Clients', icon: 'Users' },
    { id: 'Appointments', label: 'Bookings & Appointments', icon: 'Calendar' },
    { id: 'Payments', label: 'Payments & Revenue', icon: 'DollarSign' },
    { id: 'Expenses', label: 'Expenses & Overhead', icon: 'CreditCard' },
    { id: 'Employees', label: 'Employees & Roster', icon: 'UserCheck' },
    { id: 'Projects', label: 'Projects & Milestones', icon: 'FolderGit2' },
    { id: 'Inventory', label: 'Products & Inventory', icon: 'Package' },
    { id: 'Invoices', label: 'Billing & Invoices', icon: 'Receipt' },
  ];

  const toggleFocus = (id: string) => {
    if (selectedFocus.includes(id)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== id));
    } else {
      setSelectedFocus([...selectedFocus, id]);
    }
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenPhase(1);

    await new Promise((r) => setTimeout(r, 700));
    setGenPhase(2);

    await new Promise((r) => setTimeout(r, 700));
    setGenPhase(3);

    const name = businessName.trim() || 'My Business OS';
    try {
      await createNewWorkspace(name, businessType, teamSize, selectedTemplate);
    } catch (err) {
      console.error('Unable to create workspace from onboarding', err);
      const message = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : 'FORMA could not create this business OS. Please try again.';
      setGenerationError(message);
      setIsGenerating(false);
      setGenPhase(0);
      return;
    }

    await new Promise((r) => setTimeout(r, 400));
    setGenPhase(4);

    await new Promise((r) => setTimeout(r, 600));
    navigate('/app/dashboard');
  };

  const allTemplates = [...TEMPLATE_PRESETS, BLANK_TEMPLATE];

  return (
    <div className="min-h-screen bg-forma-obsidian flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-forma-limeDim/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Progress Dots */}
      {!isGenerating && (
        <div className="flex items-center gap-2 mb-8 relative z-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i
                  ? 'w-8 bg-forma-lime shadow-lime-sm'
                  : step > i
                  ? 'w-4 bg-forma-muted'
                  : 'w-4 bg-forma-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Main Container Card */}
      <div className="w-full max-w-2xl bg-forma-card/90 border border-forma-border rounded-2xl shadow-elevated p-6 sm:p-10 relative z-10 backdrop-blur-md">
        {generationError && !isGenerating && (
          <div role="alert" className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
            <strong className="font-semibold">Couldn’t create this business OS.</strong>{' '}
            {generationError}
          </div>
        )}
        {/* ================= STEP 1: BUSINESS BASICS ================= */}
        {step === 1 && !isGenerating && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-forma-lime uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 1 of 3 — Business Profile</span>
              </div>
              <h1 className="text-2xl font-bold font-display text-forma-white">
                Welcome to FORMA. Let's build your Business OS.
              </h1>
              <p className="text-xs text-forma-muted">
                Your business isn't standard. Your software shouldn't be either.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Business Name"
                placeholder="e.g. Sovereign Salon & Barber, Kronos Studio"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                autoFocus
              />

              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
                  What type of business do you run?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {businessTypes.map((type) => {
                    const isSelected = businessType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => {
                          setBusinessType(type.id);
                          // Auto match template recommendation
                          const matching = TEMPLATE_PRESETS.find((t) =>
                            t.name.toLowerCase().includes(type.id.toLowerCase().split('/')[0].trim())
                          );
                          if (matching) setSelectedTemplate(matching);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-forma-elevated border-forma-lime ring-1 ring-forma-lime shadow-lime-sm'
                            : 'bg-forma-surface border-forma-border hover:border-forma-borderHover'
                        }`}
                      >
                        <div className="w-6 h-6 rounded bg-forma-card border border-forma-border flex items-center justify-center text-forma-lime mb-2 text-xs">
                          <IconRenderer name={type.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-forma-white block leading-tight">
                          {type.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-forma-muted">
                  Team Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Solo (1)', '2-5 people', '6-15 people', '16+ team'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamSize(size)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        teamSize === size
                          ? 'bg-forma-elevated border-forma-lime text-forma-white font-semibold'
                          : 'bg-forma-surface border-forma-border text-forma-muted hover:text-forma-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-forma-border">
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                disabled={!businessName.trim()}
              >
                <span>Continue to Features</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: WHAT DO YOU MANAGE? ================= */}
        {step === 2 && !isGenerating && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-forma-lime uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 2 of 3 — Focus Areas</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-forma-white">
                What does {businessName || 'your business'} manage daily?
              </h2>
              <p className="text-xs text-forma-muted">
                Select the primary entities you want FORMA to organize into modules.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {focusOptions.map((item) => {
                const isSelected = selectedFocus.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleFocus(item.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-forma-elevated border-forma-lime ring-1 ring-forma-lime shadow-lime-sm'
                        : 'bg-forma-surface border-forma-border hover:border-forma-borderHover'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-6 h-6 rounded bg-forma-card border border-forma-border flex items-center justify-center text-forma-lime text-xs">
                        <IconRenderer name={item.icon} className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-forma-lime stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold text-forma-white block">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-forma-border">
              <Button variant="outline" size="md" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(3)}>
                <span>Choose Architecture</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: STARTING POINT TEMPLATE ================= */}
        {step === 3 && !isGenerating && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-forma-lime uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 3 of 3 — Starting Architecture</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-forma-white">
                Select your starting Business OS
              </h2>
              <p className="text-xs text-forma-muted">
                Each preset provisions production-ready modules, custom fields, relations, and dashboards.
              </p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {allTemplates.map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-forma-elevated border-forma-lime ring-1 ring-forma-lime shadow-lime-sm'
                        : 'bg-forma-surface border-forma-border hover:border-forma-borderHover hover:bg-forma-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-forma-card border border-forma-border flex items-center justify-center text-forma-lime">
                          <IconRenderer name={tpl.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-forma-white font-display">
                              {tpl.name}
                            </h4>
                            {tpl.badge && <Badge variant="lime" size="sm">{tpl.badge}</Badge>}
                          </div>
                          <span className="text-[11px] text-forma-muted">{tpl.tagline}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-forma-lime flex items-center justify-center text-forma-obsidian">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-forma-muted mt-2 leading-relaxed">
                      {tpl.description}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {tpl.modules.map((m) => (
                        <span
                          key={m.slug}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-forma-card text-forma-white border border-forma-border/60"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-forma-border">
              <Button variant="outline" size="md" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <Button variant="primary" size="md" onClick={handleStartGeneration}>
                <Zap className="w-4 h-4" />
                <span>Generate {businessName || 'Business OS'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: LIVE COMPILATION SEQUENCE ================= */}
        {isGenerating && (
          <div className="py-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-forma-limeDim border border-forma-lime/40 mx-auto flex items-center justify-center text-forma-lime shadow-lime-glow animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-forma-white">
                Assembling your Business OS...
              </h2>
              <p className="text-xs text-forma-muted">
                Configuring database schema, polymorphic fields, and custom dashboard.
              </p>
            </div>

            {/* Step checklist */}
            <div className="max-w-md mx-auto space-y-2.5 text-left text-xs font-mono">
              <div className={`p-2.5 rounded-lg border flex items-center gap-3 ${genPhase >= 1 ? 'bg-forma-surface border-forma-border text-forma-white' : 'text-forma-subtle border-forma-border/30'}`}>
                {genPhase >= 1 ? <CheckCircle2 className="w-4 h-4 text-forma-lime" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Provisioning {selectedTemplate.modules.length} business modules...</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex items-center gap-3 ${genPhase >= 2 ? 'bg-forma-surface border-forma-border text-forma-white' : 'text-forma-subtle border-forma-border/30'}`}>
                {genPhase >= 2 ? <CheckCircle2 className="w-4 h-4 text-forma-lime" /> : genPhase === 1 ? <Loader2 className="w-4 h-4 animate-spin text-forma-lime" /> : <span className="w-4" />}
                <span>Compiling dynamic field schemas & relations...</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex items-center gap-3 ${genPhase >= 3 ? 'bg-forma-surface border-forma-border text-forma-white' : 'text-forma-subtle border-forma-border/30'}`}>
                {genPhase >= 3 ? <CheckCircle2 className="w-4 h-4 text-forma-lime" /> : genPhase === 2 ? <Loader2 className="w-4 h-4 animate-spin text-forma-lime" /> : <span className="w-4" />}
                <span>Configuring analytical dashboard & widgets...</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex items-center gap-3 ${genPhase >= 4 ? 'bg-forma-surface border-forma-lime text-forma-lime font-bold' : 'text-forma-subtle border-forma-border/30'}`}>
                {genPhase >= 4 ? <CheckCircle2 className="w-4 h-4 text-forma-lime" /> : <span className="w-4" />}
                <span>Operating system generated successfully!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
