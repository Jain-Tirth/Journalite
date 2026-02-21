import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Unauthorized from './components/layout/Unauthorized';
import ForgotPassword from './components/auth/ForgotPassword';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Journal Components
import JournalList from './components/journal/JournalList';
import JournalEntryForm from './components/journal/JournalEntryForm';
import JournalDetail from './components/journal/JournalDetail';

// Insights Components
import Insights from './components/insights/Insights';

// Dashboard Components
import Dashboard from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Journal Routes */}
              <Route path="/journal" element={<JournalList />} />
              <Route path="/journal/new" element={<JournalEntryForm />} />
              <Route path="/journal/:id" element={<JournalDetail />} />
              <Route path="/journal/:id/edit" element={<JournalEntryForm />} />

              {/* Insights Route */}
              <Route path="/insights" element={<Insights />} />
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
