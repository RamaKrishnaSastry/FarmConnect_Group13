import { useEffect, useState } from 'react';
import { Topbar } from './Topbar';
import { FeatureGuide } from '../common/FeatureGuide';
import { useAuth } from '../../hooks/useAuth';
import { getTourSteps, TOUR_DONE_KEY } from '../../utils/tourSteps';

export const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!user?.role) return;
    const key = `${TOUR_DONE_KEY}_${user.role}`;
    try {
      const done = localStorage.getItem(key);
      if (!done) {
        const timer = setTimeout(() => setShowGuide(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore storage errors
    }
  }, [user?.role]);

  const handleGuideClose = (_finished) => {
    setShowGuide(false);
    if (!user?.role) return;
    try {
      localStorage.setItem(`${TOUR_DONE_KEY}_${user.role}`, 'yes');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#f7fff8_0%,#f1f9f2_100%)]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onStartTour={() => setShowGuide(true)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      <FeatureGuide
        open={showGuide}
        steps={getTourSteps(user?.role)}
        onClose={handleGuideClose}
      />
    </div>
  );
};
