const Stepper = ({ steps }) => (
  <div className="space-y-3">
    {steps.map((step, index) => (
      <div key={step.label} className="flex items-start gap-4 p-4 rounded-xl border border-teal-100 hover:bg-teal-50/30 transition">
        <div
          className={`mt-0.5 h-4 w-4 rounded-full flex-shrink-0 ${
            step.status === 'done'
              ? 'bg-emerald-600 border-2 border-emerald-700'
              : step.status === 'current'
                ? 'bg-teal-600 border-2 border-teal-700'
                : 'bg-teal-100 border-2 border-teal-200'
          }`}
        />
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">{index + 1}. {step.label}</p>
          <p className="text-xs text-slate-600 mt-1">{step.description}</p>
        </div>
      </div>
    ))}
  </div>
);

export default Stepper;
