// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/Login';
import QuestionnaireForm from './components/QuestionnaireForm';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import './app.css';
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// רכיב פנימי כדי שנוכל להשתמש ב-useAuth
function AppContent() {
  const { currentUser } = useAuth();
  
  return (
    <>
      {currentUser && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={currentUser ? <QuestionnaireForm /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
        </Routes>
      </div>
    </>
  );
}

export default App;