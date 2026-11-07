import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, LogOut, HeartPulse, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDisplayDate } from '../utils/helpers';
import ConfirmDialog from '../components/ConfirmDialog';

const Profile = () => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2.5">
          <User className="w-6 h-6 text-pink-500" />
          <span>My Profile & Preferences</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Account details and clinical glucose guideline references
        </p>
      </div>

      {/* User Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-md shadow-pink-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-pink-500" />
                <span>{user?.email}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  Member since{' '}
                  {user?.created_at ? formatDisplayDate(user.created_at.split('T')[0]) : 'Recently'}
                </span>
              </span>
              <span className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Shield className="w-3 h-3" />
                <span>Protected Account</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Clinical Target Guidelines Reference */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center space-x-2.5">
          <HeartPulse className="w-5 h-5 text-pink-500" />
          <h3 className="text-base font-bold text-slate-800">
            Clinical Reference Targets (ADA Guidelines)
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Standard blood glucose ranges for non-pregnant adults. Always consult your healthcare provider for personalized glycemic targets.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
              Fasting Blood Sugar (Morning)
            </span>
            <ul className="text-xs space-y-1.5 text-slate-600 font-medium">
              <li className="flex items-center justify-between">
                <span>Normal / Healthy:</span>
                <strong className="text-emerald-700">70 – 99 mg/dl</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Early Impairment (Pre-diabetes):</span>
                <strong className="text-amber-700">100 – 125 mg/dl</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Elevated (Diabetes threshold):</span>
                <strong className="text-rose-700">126+ mg/dl</strong>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Post-Meal (After Meals)
            </span>
            <ul className="text-xs space-y-1.5 text-slate-600 font-medium">
              <li className="flex items-center justify-between">
                <span>Normal (2 hours post-meal):</span>
                <strong className="text-emerald-700">&lt; 140 mg/dl</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Impaired Glucose Tolerance:</span>
                <strong className="text-amber-700">140 – 199 mg/dl</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Elevated:</span>
                <strong className="text-rose-700">200+ mg/dl</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out of Sweety"
        message="Are you sure you want to sign out of your session on this device?"
        confirmText="Sign Out"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default Profile;
