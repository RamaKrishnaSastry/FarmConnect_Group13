import React from 'react';
import './RoleSelector.css';

export default function RoleSelector({ onRoleSelect, onBack }) {
  const roles = [
    {
      id: 'FARMER',
      title: 'Farmer',
      description: 'List your produce and manage orders from buyers',
      icon: '🚜',
      features: ['List produce', 'Manage orders', 'Track requests']
    },
    {
      id: 'BUYER',
      title: 'Buyer',
      description: 'Browse and purchase fresh produce from local farmers',
      icon: '🛒',
      features: ['Browse produce', 'Place orders', 'Track deliveries']
    },
    {
      id: 'TRANSPORTER',
      title: 'Transporter',
      description: 'Handle deliveries between farms and buyers',
      icon: '🚚',
      features: ['Accept tasks', 'Manage deliveries', 'Track routes']
    }
  ];

  return (
    <div className="role-selector-container">
      <div className="role-header">
        <h2>Choose Your Role</h2>
        <p>Select the role that best describes you</p>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div
            key={role.id}
            className="role-card"
            onClick={() => onRoleSelect(role.id)}
          >
            <div className="role-icon">{role.icon}</div>
            <h3>{role.title}</h3>
            <p className="role-description">{role.description}</p>
            <ul className="role-features">
              {role.features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
            <button className="select-role-btn">Select {role.title}</button>
          </div>
        ))}
      </div>

      <button className="back-btn" onClick={onBack}>
        ← Back to Login
      </button>
    </div>
  );
}
