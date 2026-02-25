import { X } from 'lucide-react';

const Drawer = ({ open, title, onClose, children, footer }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-teal-100 shadow-2xl">
        <div className="px-6 py-5 border-b border-teal-100 flex items-center justify-between bg-gradient-to-br from-slate-50 via-white to-teal-50">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto text-slate-700" style={{ height: 'calc(100% - 120px)' }}>
          {children}
        </div>
        {footer && <div className="px-6 py-4 border-t border-teal-100 bg-slate-50">{footer}</div>}
      </div>
    </div>
  );
};

export default Drawer;
