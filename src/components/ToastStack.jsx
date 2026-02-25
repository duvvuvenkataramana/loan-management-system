import { X } from 'lucide-react';

const ToastStack = ({ toasts, onDismiss }) => (
  <div className="fixed top-6 right-6 z-50 space-y-3">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`w-72 rounded-xl border shadow-lg px-4 py-3 bg-white backdrop-blur-sm ${
          toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50'
            : toast.type === 'error'
              ? 'border-rose-200 bg-rose-50'
              : 'border-teal-200 bg-teal-50'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-sm font-bold ${
              toast.type === 'success'
                ? 'text-emerald-900'
                : toast.type === 'error'
                  ? 'text-rose-900'
                  : 'text-teal-900'
            }`}>{toast.title}</p>
            <p className={`text-xs mt-1 ${
              toast.type === 'success'
                ? 'text-emerald-700'
                : toast.type === 'error'
                  ? 'text-rose-700'
                  : 'text-teal-700'
            }`}>{toast.message}</p>
          </div>
          <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg p-1 transition">
            <X size={14} />
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default ToastStack;
