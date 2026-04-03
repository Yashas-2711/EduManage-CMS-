import { useEffect, useState } from 'react';
import { Users, BookOpen, CreditCard, CalendarCheck, TrendingUp, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../services/cmsService';

// Fallback stats when backend isn't connected
const DEFAULT = {
  students: 0, courses: 0, fees: { paid: 0, pending: 0 }, attendanceRate: 0,
};

const Dashboard = () => {
  const [stats, setStats]   = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Total Students', value: stats.students,
      icon: Users, bg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-600', trend: 8,
    },
    {
      label: 'Total Courses', value: stats.courses,
      icon: BookOpen, bg: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-600', trend: 3,
    },
    {
      label: 'Fees Collected', value: `₹${(stats.fees?.paid || 0).toLocaleString()}`,
      icon: CreditCard, bg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-600', trend: 12,
    },
    {
      label: 'Attendance Rate', value: `${stats.attendanceRate || 0}%`,
      icon: CalendarCheck, bg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-600', trend: -2,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Welcome back! Here's an overview of your institution.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Info strip */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Backend not connected?</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            Stats will show zeros until your Node.js API at <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">http://localhost:5000/api/v1</code> is running.
          </p>
        </div>
      </div>

      {/* Summary rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fees summary */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-green-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Fee Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Paid</span>
              <span className="text-sm font-semibold text-green-600">₹{(stats.fees?.paid || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Pending</span>
              <span className="text-sm font-semibold text-red-500">₹{(stats.fees?.pending || 0).toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.fees?.paid
                    ? Math.round(stats.fees.paid / (stats.fees.paid + stats.fees.pending) * 100)
                    : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Student', href: '/students' },
              { label: 'Add Course', href: '/courses' },
              { label: 'Record Fee', href: '/fees' },
              { label: 'Mark Attendance', href: '/attendance' },
            ].map((a) => (
              <a
                key={a.label}
                href={a.href}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 transition text-center border border-slate-100 dark:border-slate-600"
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
