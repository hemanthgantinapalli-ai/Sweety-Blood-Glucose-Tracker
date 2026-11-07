import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  BarChart3,
  User,
  LogOut,
  PlusCircle,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onOpenAddModal }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Reading History', to: '/history', icon: History },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
    { label: 'My Profile', to: '/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 min-h-screen p-5 shadow-soft z-20">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
          <HeartPulse className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Sweety
          </span>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Glucose Care
          </p>
        </div>
      </div>

      {/* Quick Add Reading Button */}
      {onOpenAddModal && (
        <button
          onClick={onOpenAddModal}
          className="w-full mb-6 px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-pink-500/25 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Reading</span>
        </button>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 shadow-sm border border-pink-100/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
