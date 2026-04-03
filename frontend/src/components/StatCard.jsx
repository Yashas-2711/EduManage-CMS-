/**
 * Reusable stat card for the dashboard
 */
const StatCard = ({ icon: Icon, label, value, bg, iconColor, trend }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{value ?? '—'}</p>
    </div>
    {trend && (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
        {trend >= 0 ? '+' : ''}{trend}%
      </span>
    )}
  </div>
);

export default StatCard;
