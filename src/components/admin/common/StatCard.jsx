

export default function StatCard({ title, value, badge, icon: Icon, iconBg, iconColor, valueColor = 'text-gray-800' }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</h3>
        {badge && <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-2 inline-block ${badge.className}`}>{badge.text}</span>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBg} ${iconColor}`}>
        <Icon />
      </div>
    </div>
  );
}