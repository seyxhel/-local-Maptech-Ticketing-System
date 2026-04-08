import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TechnicalStaffDashboard } from './TechnicalStaffDashboard';

export default function TechnicalStaffDashboardPage() {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    if (page === 'knowledge-hub') navigate('/technical-staff/knowledge-hub');
  };
  return <TechnicalStaffDashboard onNavigate={handleNavigate} />;
}
