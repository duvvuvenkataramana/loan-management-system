import { useState } from 'react';
import { X, Bell, Activity } from 'lucide-react';

const NotificationCenter = ({ open, onClose, notifications, activities, onMarkAllRead }) => {
  const [tab, setTab] = useState('notifications');

  if (!open) {
    return null;
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="absolute right-6 top-20 w-[360px] bg-gradient-to-br from-white to-slate-50 border border-teal-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-teal-100">
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50">
          <button
            onClick={() => setTab('notifications')}
            className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold border transition ${
              tab === 'notifications'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-700 border-teal-200 hover:border-teal-300'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Bell size={14} />
              Alerts {unreadCount > 0 ? `(${unreadCount})` : ''}
            </span>
          </button>
          <button
            onClick={() => setTab('activity')}
            className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold border transition ${
              tab === 'activity'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-700 border-teal-200 hover:border-teal-300'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Activity size={14} />
              Activity
            </span>
          </button>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {tab === 'notifications' && (
            <div className="px-4 py-2 space-y-2">
              {notifications.length === 0 && (
                <p className="text-sm text-slate-600 py-6 text-center">No new alerts</p>
              )}
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition ${
                    item.read ? 'border-teal-100 bg-white hover:bg-teal-50' : 'border-rose-200 bg-rose-50 hover:bg-rose-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="text-[11px] text-slate-600">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">{item.message}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'activity' && (
            <div className="px-4 py-2 space-y-2">
              {activities.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-teal-100 hover:bg-teal-50/30 transition">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="text-[11px] text-slate-500">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Mark all as read
          </button>
          <span className="text-[11px] text-slate-400">Updated just now</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
