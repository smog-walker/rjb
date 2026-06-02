import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ToastProvider from './components/ToastProvider';
import AuthProvider from './auth/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutShell from './components/LayoutShell';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Profiles = lazy(() => import('./pages/Profiles'));
const ResourceGenerator = lazy(() => import('./pages/ResourceGenerator'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const Tutoring = lazy(() => import('./pages/Tutoring'));
const Evaluation = lazy(() => import('./pages/Evaluation'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
              </Box>
            }
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<LayoutShell />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/profiles" element={<Profiles />} />
                  <Route path="/resource-generator" element={<ResourceGenerator />} />
                  <Route path="/learning-path" element={<LearningPath />} />
                  <Route path="/tutoring" element={<Tutoring />} />
                  <Route path="/evaluation" element={<Evaluation />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
