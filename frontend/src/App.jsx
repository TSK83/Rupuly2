import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import ProviderSidebar from './components/ProviderSidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';
import Trading from './pages/Trading';
import Profile from './pages/Profile';
import Withdraw from './pages/Withdraw';
import Transactions from './pages/Transactions';
import GameDetail from './pages/GameDetail';
import PlayGame from './pages/PlayGame';
import GameProgress from './pages/GameProgress';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminRequests from './pages/admin/AdminRequests';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderProfile from './pages/provider/ProviderProfile';
import ProviderGames from './pages/provider/ProviderGames';
import Settings from './pages/Settings';
import PageTransition from './components/PageTransition';

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isProviderPage = location.pathname.startsWith('/provider');

  if (isLoginPage) {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  const SidebarComponent = isAdminPage ? AdminSidebar : isProviderPage ? ProviderSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10"><SidebarComponent /></div>

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <PageTransition>
          <Routes>
            {/* کاربر */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/game/:gameId" element={<GameDetail />} />
            <Route path="/play/:taskId" element={<PlayGame />} />
            <Route path="/progress" element={<GameProgress />} />
            <Route path="/settings" element={<Settings />} />

            {/* ادمین */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/settings" element={<Settings />} />

            {/* ارائه‌دهنده */}
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/provider/games" element={<ProviderGames />} />
            <Route path="/provider/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PageTransition>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
