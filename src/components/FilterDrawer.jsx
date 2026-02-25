import { useState } from 'react';
import Drawer from './Drawer';

const FilterDrawer = ({ open, onClose }) => {
  const [status, setStatus] = useState('all');

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Advanced Filters"
      footer={
        <div className="flex items-center justify-between">
          <button className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition">Clear</button>
          <button className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20">Apply</button>
        </div>
      }
    >
      <div>
        <label className="text-xs font-semibold uppercase text-slate-600">Loan Amount</label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-slate-600">Date Range</label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <input type="date" className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white" />
          <input type="date" className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mt-2 w-full border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-slate-600">Borrower</label>
        <input
          type="text"
          placeholder="Search by name"
          className="mt-2 w-full border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
        />
      </div>
    </Drawer>
  );
};

export default FilterDrawer;
