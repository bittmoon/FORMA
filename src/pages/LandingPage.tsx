import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { TEMPLATE_PRESETS } from '@/features/templates/templatePresets';
import {
  Sparkles,
  ArrowRight,
  Boxes,
  Workflow,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Store,
  Layers,
  Database,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const headlineStart = "Your business isn't standard.";
  const headlineEnd = "Your software shouldn't be either.";
  const [typedCharacters, setTypedCharacters] = useState(0);
  const headline = `${headlineStart} ${headlineEnd}`;

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setTypedCharacters(headline.length);
      return;
    }

    const timer = window.setInterval(() => {
      setTypedCharacters((current) => {
        if (current >= headline.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 42);

    return () => window.clearInterval(timer);
  }, [headline.length]);

  const typedStart = headline.slice(0, Math.min(typedCharacters, headlineStart.length));
  const typedEnd = typedCharacters > headlineStart.length
    ? headline.slice(headlineStart.length + 1, typedCharacters)
    : '';

  return (
    <div className="min-h-screen bg-forma-obsidian text-forma-white selection:bg-forma-lime selection:text-forma-obsidian font-sans overflow-x-hidden">
      {/* Navigation Bar */}
      <header className="h-16 border-b border-forma-border/80 sticky top-0 z-40 bg-forma-obsidian/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-forma-card border border-forma-border group-hover:border-forma-lime flex items-center justify-center transition-colors">
            <div className="w-4 h-4 bg-forma-lime rounded-xs rotate-45" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-base tracking-wider text-forma-white">
              FORMA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-forma-lime" />
          </div>
        </NavLink>

        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="text-xs font-medium text-forma-muted hover:text-forma-white transition-colors px-3 py-1.5"
          >
            Sign In
          </NavLink>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/onboarding')}
          >
            <span>Launch Your OS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8">
        {/* Hero atmosphere */}
        <div className="landing-hero-glow absolute top-4 left-1/2 -translate-x-1/2 w-[760px] h-[330px] rounded-full pointer-events-none" />
        <div className="landing-hero-glow-accent absolute top-20 left-1/2 -translate-x-1/2 w-[440px] h-[180px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forma-surface border border-forma-border text-xs text-forma-white shadow-sm">
          <span className="w-2 h-2 rounded-full bg-forma-lime animate-pulse" />
          <span className="font-mono text-forma-lime font-bold">FORMA 1.0</span>
          <span className="text-forma-subtle">·</span>
          <span>The Bespoke Business OS Builder</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 aria-label={headline} className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-forma-white leading-[1.08] min-h-[2.2em]">
            <span aria-hidden="true">
              {typedStart}
              {typedCharacters > headlineStart.length && ' '}
            </span>
            <span aria-hidden="true" className="text-transparent bg-clip-text bg-gradient-to-r from-forma-lime via-forma-white to-forma-lime">
              {typedEnd}
            </span>
            <span aria-hidden="true" className={`landing-type-cursor ${typedCharacters >= headline.length ? 'landing-type-cursor-idle' : ''}`} />
          </h1>
          <p className="text-base sm:text-lg text-forma-muted max-w-2xl mx-auto leading-relaxed">
            Build the custom business operating system that fits you. Create tailored modules, custom fields, live analytical dashboards, and automated workflows without code.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build Your Business OS</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/app/dashboard')}
            className="w-full sm:w-auto bg-forma-surface/60"
          >
            <Store className="w-4 h-4" />
            <span>Explore Live Sandbox</span>
          </Button>
        </div>

        {/* Live Architecture Metaphor Preview */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="forma-panel p-6 sm:p-8 rounded-3xl border border-forma-border shadow-elevated relative overflow-hidden bg-forma-grid text-left">
            <div className="flex items-center justify-between pb-6 border-b border-forma-border">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <span className="text-xs font-mono text-forma-muted">
                  forma://os-engine/active-workspace
                </span>
              </div>
              <Badge variant="lime" size="sm">
                COMPLEX UNDERNEATH. SIMPLE ON TOP.
              </Badge>
            </div>

            {/* Modular Blocks Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-forma-surface border border-forma-border space-y-2">
                <div className="flex items-center justify-between text-xs text-forma-muted font-mono">
                  <span>STEP 1: DEFINE MODULES</span>
                  <Boxes className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <h4 className="text-sm font-bold text-forma-white font-display">Customers & Bookings</h4>
                <p className="text-[11px] text-forma-muted">
                  Polymorphic schemas mapped directly to your business terminology.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-forma-surface border border-forma-border space-y-2">
                <div className="flex items-center justify-between text-xs text-forma-muted font-mono">
                  <span>STEP 2: AUTOMATE WORKFLOWS</span>
                  <Workflow className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-forma-white font-display">When Completed → Bill</h4>
                <p className="text-[11px] text-forma-muted">
                  Connect appointments, payments, and client profiles automatically.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-forma-surface border border-forma-border space-y-2">
                <div className="flex items-center justify-between text-xs text-forma-muted font-mono">
                  <span>STEP 3: RUN BUSINESS</span>
                  <LayoutDashboard className="w-3.5 h-3.5 text-forma-lime" />
                </div>
                <h4 className="text-sm font-bold text-forma-white font-display">Command Center</h4>
                <p className="text-[11px] text-forma-muted">
                  Live revenue metrics, appointment calendars, and instant search.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Presets Section */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-forma-border/70 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-forma-white">
            Pre-Configured Operating Systems
          </h2>
          <p className="text-xs sm:text-sm text-forma-muted leading-relaxed">
            Templates are full configurations of the same underlying metadata engine. Deploy with 1-click and customize every field to match your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATE_PRESETS.map((tpl) => (
            <div
              key={tpl.id}
              className="forma-card p-6 rounded-2xl border border-forma-border hover:border-forma-lime/60 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forma-surface border border-forma-border flex items-center justify-center text-forma-lime group-hover:border-forma-lime transition-colors">
                      <IconRenderer name={tpl.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-forma-white font-display">
                        {tpl.name}
                      </h3>
                      <span className="text-xs text-forma-muted">{tpl.tagline}</span>
                    </div>
                  </div>
                  {tpl.badge && <Badge variant="lime" size="sm">{tpl.badge}</Badge>}
                </div>

                <p className="text-xs text-forma-muted leading-relaxed">
                  {tpl.description}
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase text-forma-subtle tracking-wider">
                    Included Modules:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {tpl.modules.map((m) => (
                      <span
                        key={m.slug}
                        className="text-xs font-medium px-2.5 py-1 rounded-md bg-forma-surface text-forma-white border border-forma-border flex items-center gap-1.5"
                      >
                        <IconRenderer name={m.icon} className="w-3 h-3 text-forma-lime" />
                        <span>{m.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-forma-border flex items-center justify-between">
                <span className="text-xs text-forma-muted font-mono">
                  {tpl.modules.length} modules · {tpl.widgets.length} widgets
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/onboarding')}
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 border-t border-forma-border/80 text-center text-xs text-forma-muted space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3.5 h-3.5 bg-forma-lime rounded-xs rotate-45" />
          <span className="font-display font-bold text-forma-white">FORMA</span>
          <span>— Business, your way.</span>
        </div>
        <p className="text-[11px] text-forma-subtle">
          Architected with React, TypeScript, Supabase, PostgreSQL JSONB, and Tailored Design Tokens.
        </p>
      </footer>
    </div>
  );
};
