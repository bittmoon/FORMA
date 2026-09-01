import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { WorkspaceProvider } from '@/features/workspaces/WorkspaceContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import { DashboardPage } from '@/pages/DashboardPage';
import { ModuleRecordsPage } from '@/pages/ModuleRecordsPage';
import { SettingsPage } from '@/pages/SettingsPage';

// Builder
import { BuilderLayout } from '@/features/builder/BuilderLayout';
import { BuilderOverview } from '@/features/builder/BuilderOverview';
import { ModuleBuilder } from '@/features/builder/ModuleBuilder';
import { DashboardBuilder } from '@/features/builder/DashboardBuilder';
import { WorkflowBuilder } from '@/features/builder/WorkflowBuilder';
import { TeamAndRoles } from '@/features/builder/TeamAndRoles';
import { BrandingSettings } from '@/features/builder/BrandingSettings';

export function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="modules/:moduleId" element={<ModuleRecordsPage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* Builder Sub-Routes */}
                <Route path="builder" element={<BuilderLayout />}>
                  <Route index element={<BuilderOverview />} />
                  <Route path="modules" element={<ModuleBuilder />} />
                  <Route path="dashboard" element={<DashboardBuilder />} />
                  <Route path="workflows" element={<WorkflowBuilder />} />
                  <Route path="team" element={<TeamAndRoles />} />
                  <Route path="branding" element={<BrandingSettings />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
