import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen, Brain, Calendar, FileText, GraduationCap,
  LayoutDashboard, LogOut, MessageCircle, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/materials', label: 'Materials', icon: FileText },
  { to: '/tutor', label: 'AI Tutor', icon: MessageCircle },
  { to: '/quiz', label: 'Quiz', icon: Brain },
  { to: '/planner', label: 'Study Plan', icon: Calendar },
  { to: '/analytics', label: 'Analytics', icon: Sparkles },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary-300" />
            <div>
              <h1 className="text-xl font-bold">EduGenie</h1>
              <p className="text-xs text-primary-300">AI Learning Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary-300" />
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-primary-300 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-primary-200 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
