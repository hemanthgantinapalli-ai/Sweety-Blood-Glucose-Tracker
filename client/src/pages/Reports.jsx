import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Scale,
  Activity,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { reportService } from '../services/reportService';
import { getTodayString, formatDisplayDate } from '../utils/helpers';
import DashboardCard from '../components/DashboardCard';
import GlucoseBadge from '../components/GlucoseBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Reports = () => {
  const today = getTodayString();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'month-to-date', 'previous-month'
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'daily') {
        res = await reportService.getDailyReport(selectedDate);
      } else if (activeTab === 'month-to-date') {
        res = await reportService.getMonthToDateReport(selectedDate);
      } else if (activeTab === 'previous-month') {
        res = await reportService.getPreviousMonthReport(selectedDate);
      }
      if (res && res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, selectedDate]);

  const stats = reportData?.statistics;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-pink-500" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Clinical summaries and statistical aggregates of your glucose levels
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-soft">
          <Calendar className="w-4 h-4 text-pink-500" />
          <span className="text-xs font-bold text-slate-600">Selected Date:</span>
          <input
            type="date"
            max={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-slate-100/80 max-w-md">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'daily'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setActiveTab('month-to-date')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'month-to-date'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Month-to-Date
        </button>
        <button
          onClick={() => setActiveTab('previous-month')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'previous-month'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Previous Month
        </button>
      </div>

      {/* Report Content */}
      {loading ? (
        <LoadingSpinner message="Calculating aggregate metrics..." />
      ) : !reportData || stats?.total_readings === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No data available for this report period"
          description={`There are no glucose readings logged for the ${
            activeTab === 'daily'
              ? `date ${selectedDate}`
              : activeTab === 'month-to-date'
              ? `month-to-date range ending ${selectedDate}`
              : 'previous calendar month'
          }.`}
        />
      ) : (
        <div className="space-y-6">
          {/* Date Range Description Banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft flex items-center justify-between text-xs font-medium text-slate-600">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>
                {activeTab === 'daily' && (
                  <>Showing readings strictly for <strong>{formatDisplayDate(selectedDate)}</strong> ({selectedDate})</>
                )}
                {activeTab === 'month-to-date' && (
                  <>
                    Report range: <strong>{reportData.start_date}</strong> to{' '}
                    <strong>{reportData.end_date}</strong>
                  </>
                )}
                {activeTab === 'previous-month' && (
                  <>
                    Full previous month range: <strong>{reportData.start_date}</strong> to{' '}
                    <strong>{reportData.end_date}</strong>
                  </>
                )}
              </span>
            </div>
            <span className="font-bold text-slate-700">
              {stats.total_readings} Total {stats.total_readings === 1 ? 'Reading' : 'Readings'}
            </span>
          </div>

          {/* Aggregate Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <DashboardCard
              title="Highest Reading"
              value={stats.highest_reading}
              subtitle="Max value recorded"
              icon={TrendingUp}
              colorScheme="pink"
            />
            <DashboardCard
              title="Lowest Reading"
              value={stats.lowest_reading}
              subtitle="Min value recorded"
              icon={TrendingDown}
              colorScheme="lavender"
            />
            <DashboardCard
              title="Average Reading"
              value={stats.average_reading}
              subtitle="Rounded to 1 decimal place"
              icon={Scale}
              colorScheme="teal"
            />
            <DashboardCard
              title="Total Readings"
              value={stats.total_readings}
              unit="readings"
              subtitle="Records in period"
              icon={Activity}
              colorScheme="blue"
            />
          </div>

          {/* Daily Report Individual Readings */}
          {activeTab === 'daily' && reportData.readings && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-pink-500" />
                <span>Readings for {formatDisplayDate(selectedDate)}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {reportData.readings.map((reading) => (
                  <div
                    key={reading.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{reading.time_slot}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Logged on {reading.reading_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1 justify-end">
                        <span className="text-xl font-extrabold text-slate-800">
                          {reading.glucose_value}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">mg/dl</span>
                      </div>
                      <GlucoseBadge
                        value={reading.glucose_value}
                        timeSlot={reading.time_slot}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart for Monthly Trends */}
          {(activeTab === 'month-to-date' || activeTab === 'previous-month') &&
            reportData.daily_breakdown &&
            reportData.daily_breakdown.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span>Daily Average Glucose Trend</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Daily mean values in mg/dl across the selected period
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reportData.daily_breakdown}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => {
                          const parts = val.split('-');
                          return `${parts[1]}/${parts[2]}`;
                        }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        domain={[40, 'auto']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                        }}
                        formatter={(value) => [`${value} mg/dl`, 'Average']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <ReferenceLine
                        y={100}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        label={{ value: 'Target Fasting (100)', fill: '#10b981', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={140}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={{ value: 'Target Post-Meal (140)', fill: '#f59e0b', fontSize: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_glucose"
                        stroke="#ec4899"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6, fill: '#db2777' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Reports;

