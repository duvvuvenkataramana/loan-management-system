import { X } from 'lucide-react';

const Modal = ({ open, title, onClose, children, actions }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-teal-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-teal-50">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 text-slate-700">{children}</div>
        {actions && <div className="px-6 py-4 border-t border-teal-100 bg-slate-50 flex items-center justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
