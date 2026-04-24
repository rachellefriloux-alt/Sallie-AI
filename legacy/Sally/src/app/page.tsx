'use client';

import { useEffect, useState } from 'react';
import { SallieStudio } from '@/components/SallieStudioOS';
import { FirstRunWizard } from '@/components/FirstRunWizard';
import { useNotifications } from '@/hooks/useNotifications';

export default function Home() {
  const [checking, setChecking] = useState(true);
  const [showFirstRun, setShowFirstRun] = useState(false);

  const { addNotification } = useNotifications();

  useEffect(() => {
    const hasCompletedFirstRun = localStorage.getItem('sallie_first_run_completed');
    if (!hasCompletedFirstRun) {
      setShowFirstRun(true);
    }
    setChecking(false);
  }, []);

  const handleFirstRunComplete = () => {
    localStorage.setItem('sallie_first_run_completed', 'true');
    setShowFirstRun(false);
    addNotification({
      type: 'success',
      title: 'Setup Complete',
      message: 'Sallie Studio is ready to use!',
    });
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg font-medium">Initializing Sallie...</p>
        </div>
      </div>
    );
  }

  if (showFirstRun) {
    return <FirstRunWizard onComplete={handleFirstRunComplete} />;
  }

  return <SallieStudio />;
}
