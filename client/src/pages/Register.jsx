import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password must match.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 via-purple-50/20 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Sweety
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Start logging your blood glucose readings with ease
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-100 shadow-soft">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-pink-500" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30 transition-all ${
                  clientErrors.name ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                }`}
              />
              {clientErrors.name && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{clientErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-pink-500" />
                <span>Email address</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30 transition-all ${
                  clientErrors.email ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                }`}
              />
              {clientErrors.email && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{clientErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-500" />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30 transition-all ${
                  clientErrors.password ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                }`}
              />
              {clientErrors.password && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{clientErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-500" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30 transition-all ${
                  clientErrors.confirmPassword ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                }`}
              />
              {clientErrors.confirmPassword && (
                <p className="mt-1 text-xs font-semibold text-rose-600">
                  {clientErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-500/25 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-pink-600 hover:text-pink-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

