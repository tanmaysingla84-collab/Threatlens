import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FileAnalysis from './pages/FileAnalysis';
import UrlAnalysis from './pages/UrlAnalysis';
import IpAnalysis from './pages/IpAnalysis';
import DomainAnalysis from './pages/DomainAnalysis';
import HashLookup from './pages/HashLookup';
import ScanHistory from './pages/ScanHistory';


import ForgotPassword from './pages/ForgotPassword';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,         // 30 seconds before data is considered stale
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* ── Public routes (redirected since platform is login-free) ── */}
              <Route path="/login"    element={<Navigate to="/dashboard" replace />} />
              <Route path="/register"        element={<Navigate to="/dashboard" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />

              {/* ── Protected routes (wrapped in sidebar Layout) ── */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze/file"
                element={
                  <ProtectedRoute>
                    <Layout><FileAnalysis /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze/url"
                element={
                  <ProtectedRoute>
                    <Layout><UrlAnalysis /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze/ip"
                element={
                  <ProtectedRoute>
                    <Layout><IpAnalysis /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze/domain"
                element={
                  <ProtectedRoute>
                    <Layout><DomainAnalysis /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze/hash"
                element={
                  <ProtectedRoute>
                    <Layout><HashLookup /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <Layout><ScanHistory /></Layout>
                  </ProtectedRoute>
                }
              />


              {/* ── Fallbacks ── */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
