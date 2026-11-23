import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Bell,
  BarChart3,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { role, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Students', path: '/students', icon: Users },
          { name: 'Teachers', path: '/teachers', icon: GraduationCap },
          { name: 'Courses', path: '/courses', icon: BookOpen },
          { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
          { name: 'Exam Results', path: '/results', icon: Award },
          { name: 'Notice Board', path: '/notices', icon: Bell },
          { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
          { name: 'My Profile', path: '/profile', icon: User },
        ];
      case 'teacher':
        return [
          { name: 'Teacher Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Assigned Students', path: '/students', icon: Users },
          { name: 'Courses', path: '/courses', icon: BookOpen },
          { name: 'Mark Attendance', path: '/attendance', icon: CalendarCheck },
          { name: 'Publish Results', path: '/results', icon: Award },
          { name: 'College Notices', path: '/notices', icon: Bell },
          { name: 'Teacher Profile', path: '/profile', icon: User },
        ];
      case 'student':
        return [
          { name: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Courses', path: '/courses', icon: BookOpen },
          { name: 'My Attendance', path: '/attendance', icon: CalendarCheck },
          { name: 'My Examination Results', path: '/results', icon: Award },
          { name: 'Notice Board', path: '/notices', icon: Bell },
          { name: 'Student Profile', path: '/profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        ></div>
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{link.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info / quick logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <button
            onClick={() => {
              onCloseMobile();
              logout();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
