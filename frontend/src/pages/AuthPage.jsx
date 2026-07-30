import React, { useState } from 'react';
import './AuthPage.css';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import RoleSelector from '../components/RoleSelector';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleRegisterClick = () => {
    setShowRoleSelector(true);
    setIsLogin(false);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleSelector(false);
  };

  const handleBackToAuth = () => {
    setIsLogin(true);
    setSelectedRole(null);
    setShowRoleSelector(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="app-title">FarmConnect</h1>
          <p className="app-subtitle">Connecting Farmers, Buyers & Transporters</p>
        </div>

        {isLogin ? (
          <>
            <LoginForm onSwitchToRegister={handleRegisterClick} />
          </>
        ) : showRoleSelector ? (
          <RoleSelector
            onRoleSelect={handleRoleSelect}
            onBack={() => setIsLogin(true)}
          />
        ) : (
          <RegisterForm
            role={selectedRole}
            onBackToLogin={handleBackToAuth}
          />
        )}
      </div>

      <div className="auth-footer">
        <p>&copy; 2024 FarmConnect. All rights reserved.</p>
      </div>
    </div>
  );
}
