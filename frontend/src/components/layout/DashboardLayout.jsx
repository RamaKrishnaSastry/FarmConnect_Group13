import { Topbar } from './Topbar';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#f7fff8_0%,#f1f9f2_100%)]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
