import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  HeartPulse,
  Activity,
  Calendar,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/40 via-purple-50/20 to-white flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Sweety
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-pink-600 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-pink-500/25 transition-all active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 text-pink-700 text-xs font-bold mb-6 shadow-sm border border-pink-200/50">
          <ShieldCheck className="w-4 h-4 text-pink-600" />
          <span>Professional Blood Glucose Tracking Made Delightful</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-[1.15]">
          Take Control of Your Health with{' '}
          <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            Sweety
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Log fasting and post-meal glucose readings effortlessly. Get instant daily summaries,
          month-to-date analysis, and historical insights with medical-grade precision.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-pink-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>Start Tracking Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-base shadow-sm transition-all"
          >
            Sign In with Demo
          </Link>
        </div>

        {/* Value Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">4 Time Slots Daily</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Track fasting, after breakfast, lunch, and dinner with strictly enforced duplicate prevention.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Smart Aggregations</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Automatic highest, lowest, and average calculations rounded to one decimal place for clinical clarity.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Secure & Private</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Strict row-level user authorization ensures your sensitive medical metrics remain strictly private.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Sweety Blood Glucose Tracker • Designed for Kenpath Full Stack Technical Assessment</p>
      </footer>
    </div>
  );
};

export default Landing;
