import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ensureDemoWorkspace } from '@/lib/storage';

export const SignupPage: React.FC = () => {
  const { signup, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError('');

    const res = await signup(email.trim(), password, name.trim());
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-forma-obsidian flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-forma-limeDim/25 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center space-y-2 relative z-10">
        <NavLink to="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-forma-card border border-forma-border flex items-center justify-center">
            <div className="w-4 h-4 bg-forma-lime rounded-xs rotate-45" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-forma-white">
            FORMA
          </span>
        </NavLink>
        <p className="text-xs text-forma-muted">
          Build the business OS that fits you. Create your account.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-forma-card/90 border border-forma-border rounded-2xl p-6 sm:p-8 shadow-elevated relative z-10 backdrop-blur-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="Alex Vance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="founder@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
            <span>Create Account & Start OS</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="pt-4 border-t border-forma-border space-y-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full text-xs text-forma-lime border-forma-lime/30 bg-forma-limeDim/30 hover:bg-forma-limeDim"
            onClick={() => {
              loginDemo();
              ensureDemoWorkspace();
              navigate('/app/dashboard');
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Access (No password required)</span>
          </Button>

          <p className="text-center text-xs text-forma-muted">
            Already have an account?{' '}
            <NavLink to="/login" className="text-forma-lime hover:underline font-semibold">
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};
