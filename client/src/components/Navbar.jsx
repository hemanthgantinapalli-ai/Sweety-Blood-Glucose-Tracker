import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  HeartPulse,
  LayoutDashboard,
  History,
  BarChart3,
  User,
  LogOut,
  PlusCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTodayString, formatDisplayDate } from '../utils/helpers';

const Navbar = ({ onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const today = getTodayString();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Reading History', to: '/history', icon: History },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center space-x-3 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Sweety
          </span>
        </div>
      </div>

      {/* Desktop Date & Status Indicator */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-pink-500" />
          <span>Today: {formatDisplayDate(today)}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Monitor Active</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="md:hidden px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-xs shadow-sm flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}

        <div className="flex items-center space-x-3 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="hidden md:inline text-sm font-semibold text-slate-700">
            {user?.name}
          </span>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 md:hidden flex flex-col space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-pink-50 text-pink-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

