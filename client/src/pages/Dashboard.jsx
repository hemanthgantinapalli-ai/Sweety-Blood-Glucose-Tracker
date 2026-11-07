import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Scale,
  PlusCircle,
  Calendar,
  Clock,
  ArrowRight,
  Sun,
  Coffee,
  Utensils,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { readingService } from '../services/readingService';
import { getTodayString, formatDisplayDate } from '../utils/helpers';
import DashboardCard from '../components/DashboardCard';
import GlucoseBadge from '../components/GlucoseBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const { openAddModal, refreshTrigger } = useOutletContext();
  const today = getTodayString();

  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState(null);
  const [todayReadings, setTodayReadings] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch daily report for today
        const reportRes = await reportService.getDailyReport(today);
        if (reportRes.success) {
          setDailyStats(reportRes.statistics);
          setTodayReadings(reportRes.readings || []);
        }

        // Fetch last 5 recent readings
        const recentRes = await readingService.getReadings({ limit: 5 });
        if (recentRes.success) {
          setRecentReadings(recentRes.readings || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [today, refreshTrigger]);

  const slotIcons = {
    'Morning (fasting)': Sun,
    'After breakfast': Coffee,
    'After lunch': Utensils,
    'After dinner': Moon,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/5 border border-pink-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Overview</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Hello, {user?.name || 'Friend'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is your blood glucose snapshot for <span className="font-semibold text-slate-700">{formatDisplayDate(today)}</span>.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="self-start md:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-pink-500/25 transition-all active:scale-[0.98] flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Glucose Reading</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating your glucose analytics..." />
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-pink-500" />
                <span>Today's Statistics</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {dailyStats?.total_readings || 0} of 4 slots logged
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <DashboardCard
                title="Highest"
                value={dailyStats?.highest_reading}
                subtitle="Peak measured level"
                icon={TrendingUp}
                colorScheme="pink"
              />
              <DashboardCard
                title="Lowest"
                value={dailyStats?.lowest_reading}
                subtitle="Minimum measured level"
                icon={TrendingDown}
                colorScheme="lavender"
              />
              <DashboardCard
                title="Average"
                value={dailyStats?.average_reading}
                subtitle="Daily mean value"
                icon={Scale}
                colorScheme="teal"
              />
              <DashboardCard
                title="Total Readings"
                value={dailyStats?.total_readings || 0}
                unit="readings"
                subtitle="Max 4 permitted per day"
                icon={Activity}
                colorScheme="blue"
              />
            </div>
          </div>

          {/* Today's Schedule & Slot Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>Today's Time Slots</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {todayReadings.length} completed
                </span>
              </div>

              {todayReadings.length === 0 ? (
                <EmptyState
                  title="No readings yet today"
                  description="Start your health check by recording your Morning (fasting) or post-meal glucose."
                  actionLabel="Add First Reading"
                  onAction={openAddModal}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {['Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner'].map(
                    (slot) => {
                      const reading = todayReadings.find((r) => r.time_slot === slot);
                      const Icon = slotIcons[slot] || Activity;

                      return (
                        <div
                          key={slot}
                          className={`p-4 rounded-2xl border transition-all ${
                            reading
                              ? 'bg-white border-slate-100 shadow-soft'
                              : 'bg-slate-50/60 border-dashed border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                                  reading
                                    ? 'bg-pink-50 text-pink-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{slot}</span>
                            </div>
                            {reading && (
                              <GlucoseBadge
                                value={reading.glucose_value}
                                timeSlot={reading.time_slot}
                              />
                            )}
                          </div>

                          {reading ? (
                            <div className="flex items-baseline space-x-1 pl-1">
                              <span className="text-2xl font-extrabold text-slate-800">
                                {reading.glucose_value}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">mg/dl</span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 pl-1 py-1">
                              Not recorded yet
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Recent History Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>Recent Readings</span>
                </h3>
                <Link
                  to="/history"
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 divide-y divide-slate-100">
                {recentReadings.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No recent history available.
                  </p>
                ) : (
                  recentReadings.map((reading) => (
                    <div key={reading.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{reading.time_slot}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {formatDisplayDate(reading.reading_date)}
                        </p>
                      </div>
                      <GlucoseBadge
                        value={reading.glucose_value}
                        timeSlot={reading.time_slot}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
