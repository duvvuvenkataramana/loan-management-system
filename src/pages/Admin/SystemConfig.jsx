import { useState } from 'react';
import { useToast, useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Edit2, Plus, Trash2 } from 'lucide-react';

const SystemConfig = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  
  // Use global state from AppContext - changes will reflect in all dashboards
  const { loanTypes, setLoanTypes, interestRules, setInterestRules, penaltySettings, setPenaltySettings } = useApp();
  
  // Check if user is admin or lender - show buttons for all users for demo purposes
  const canEdit = true;

  // Modal states
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [showEditLoanModal, setShowEditLoanModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [showEditPenaltyModal, setShowEditPenaltyModal] = useState(false);

  // Form states
  const [newLoan, setNewLoan] = useState({ name: '', rate: '', tenureMin: '', tenureMax: '' });
  const [editingLoan, setEditingLoan] = useState(null);
  const [newRule, setNewRule] = useState({ tier: '', minScore: '', maxScore: '', rate: '' });
  const [editingRule, setEditingRule] = useState(null);
  const [editingPenalty, setEditingPenalty] = useState({ ...penaltySettings });

  // Loan Type Functions
  const handleAddLoanType = () => {
    if (!newLoan.name || !newLoan.rate || !newLoan.tenureMin || !newLoan.tenureMax) {
      addToast('error', 'Validation Error', 'Please fill all fields');
      return;
    }
    const loan = {
      id: Date.now(),
      name: newLoan.name,
      rate: newLoan.rate,
      tenureMin: parseInt(newLoan.tenureMin),
      tenureMax: parseInt(newLoan.tenureMax),
    };
    setLoanTypes([...loanTypes, loan]);
    setNewLoan({ name: '', rate: '', tenureMin: '', tenureMax: '' });
    setShowAddLoanModal(false);
    addToast('success', 'Loan Type Added', `${loan.name} has been added successfully`);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan({ ...loan });
    setShowEditLoanModal(true);
  };

  const handleDeleteLoan = (loanId, loanName) => {
    if (window.confirm(`Are you sure you want to delete "${loanName}"?`)) {
      setLoanTypes(loanTypes.filter(l => l.id !== loanId));
      addToast('success', 'Loan Type Deleted', `${loanName} has been deleted`);
    }
  };

  const handleUpdateLoan = () => {
    if (!editingLoan.name || !editingLoan.rate || !editingLoan.tenureMin || !editingLoan.tenureMax) {
      addToast('error', 'Validation Error', 'Please fill all fields');
      return;
    }
    setLoanTypes(loanTypes.map(l => l.id === editingLoan.id ? editingLoan : l));
    setShowEditLoanModal(false);
    setEditingLoan(null);
    addToast('success', 'Loan Type Updated', 'Loan type has been updated successfully');
  };

  // Interest Rules Functions
  const handleAddRule = () => {
    if (!newRule.tier || !newRule.minScore || !newRule.maxScore || !newRule.rate) {
      addToast('error', 'Validation Error', 'Please fill all fields');
      return;
    }
    const rule = {
      id: Date.now(),
      tier: newRule.tier,
      minScore: parseInt(newRule.minScore),
      maxScore: parseInt(newRule.maxScore),
      rate: newRule.rate,
    };
    setInterestRules([...interestRules, rule]);
    setNewRule({ tier: '', minScore: '', maxScore: '', rate: '' });
    setShowAddRuleModal(false);
    addToast('success', 'Interest Rule Added', 'New interest rule has been added');
  };

  const handleEditRule = (rule) => {
    setEditingRule({ ...rule });
    setShowEditRuleModal(true);
  };

  const handleDeleteRule = (ruleId, ruleTier) => {
    if (window.confirm(`Are you sure you want to delete "${ruleTier}" rule?`)) {
      setInterestRules(interestRules.filter(r => r.id !== ruleId));
      addToast('success', 'Interest Rule Deleted', `${ruleTier} rule has been deleted`);
    }
  };

  const handleUpdateRule = () => {
    if (!editingRule.tier || !editingRule.minScore || !editingRule.maxScore || !editingRule.rate) {
      addToast('error', 'Validation Error', 'Please fill all fields');
      return;
    }
    setInterestRules(interestRules.map(r => r.id === editingRule.id ? editingRule : r));
    setShowEditRuleModal(false);
    setEditingRule(null);
    addToast('success', 'Interest Rule Updated', 'Interest rule has been updated');
  };

  // Penalty Settings Functions
  const handleEditPenalty = () => {
    setEditingPenalty({ ...penaltySettings });
    setShowEditPenaltyModal(true);
  };

  const handleSavePenalty = () => {
    setPenaltySettings(editingPenalty);
    setShowEditPenaltyModal(false);
    addToast('success', 'Settings Saved', 'Penalty and grace settings have been updated');
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>
        <p className="text-sm text-slate-500">Maintain loan products, interest rules, and penalties.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Types */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Loan Types</h3>
            {canEdit && (
              <button 
                onClick={() => setShowAddLoanModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
              >
                <Plus size={14} /> Add
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {loanTypes.map((item) => (
              <div key={item.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Tenure {item.tenureMin}-{item.tenureMax} months</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700">
                    {item.rate}%
                  </span>
                  {canEdit && (
                    <>
                      <button 
                        onClick={() => handleEditLoan(item)}
                        className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLoan(item.id, item.name)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interest Rules */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Interest Rules</h3>
            {canEdit && (
              <button 
                onClick={() => setShowAddRuleModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
              >
                <Plus size={14} /> Add
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {interestRules.map((item) => (
              <div key={item.id} className="border border-teal-100 rounded-xl p-3 hover:bg-teal-50 hover:border-teal-200 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.tier}</p>
                    <p className="text-xs text-slate-600">Score {item.minScore}-{item.maxScore}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      {item.rate}%
                    </span>
                    {canEdit && (
                      <>
                        <button 
                          onClick={() => handleEditRule(item)}
                          className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRule(item.id, item.tier)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Penalty & Grace Settings */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Penalty & Grace Settings</h3>
          {canEdit && (
            <button 
              onClick={handleEditPenalty}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-teal-100 rounded-xl p-4 hover:shadow-sm hover:border-teal-200 transition">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Late Fee</p>
            <p className="text-xl font-bold mt-2 text-slate-900">{penaltySettings.lateFee}% of EMI</p>
          </div>
          <div className="border border-teal-100 rounded-xl p-4 hover:shadow-sm hover:border-teal-200 transition">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Grace Period</p>
            <p className="text-xl font-bold mt-2 text-slate-900">{penaltySettings.gracePeriod} days</p>
          </div>
          <div className="border border-teal-100 rounded-xl p-4 hover:shadow-sm hover:border-teal-200 transition">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Default Threshold</p>
            <p className="text-xl font-bold mt-2 text-slate-900">{penaltySettings.defaultThreshold} days</p>
          </div>
        </div>
      </section>

      {/* Add Loan Type Modal */}
      <Modal open={showAddLoanModal} onClose={() => setShowAddLoanModal(false)} title="Add New Loan Type" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Loan Name</label>
            <input
              type="text"
              value={newLoan.name}
              onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
              placeholder="e.g., Personal loan"
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={newLoan.rate}
              onChange={(e) => setNewLoan({ ...newLoan, rate: e.target.value })}
              placeholder="e.g., 10.5"
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Min Tenure (months)</label>
              <input
                type="number"
                value={newLoan.tenureMin}
                onChange={(e) => setNewLoan({ ...newLoan, tenureMin: e.target.value })}
                placeholder="12"
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Max Tenure (months)</label>
              <input
                type="number"
                value={newLoan.tenureMax}
                onChange={(e) => setNewLoan({ ...newLoan, tenureMax: e.target.value })}
                placeholder="36"
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setShowAddLoanModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddLoanType}
              className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition"
            >
              Add Loan Type
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Loan Type Modal */}
      <Modal open={showEditLoanModal} onClose={() => setShowEditLoanModal(false)} title="Edit Loan Type" size="md">
        {editingLoan && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Loan Name</label>
              <input
                type="text"
                value={editingLoan.name}
                onChange={(e) => setEditingLoan({ ...editingLoan, name: e.target.value })}
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={editingLoan.rate}
                onChange={(e) => setEditingLoan({ ...editingLoan, rate: e.target.value })}
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Min Tenure (months)</label>
                <input
                  type="number"
                  value={editingLoan.tenureMin}
                  onChange={(e) => setEditingLoan({ ...editingLoan, tenureMin: parseInt(e.target.value) })}
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Max Tenure (months)</label>
                <input
                  type="number"
                  value={editingLoan.tenureMax}
                  onChange={(e) => setEditingLoan({ ...editingLoan, tenureMax: parseInt(e.target.value) })}
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowEditLoanModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateLoan}
                className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Interest Rule Modal */}
      <Modal open={showAddRuleModal} onClose={() => setShowAddRuleModal(false)} title="Add Interest Rule" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Tier Name</label>
            <input
              type="text"
              value={newRule.tier}
              onChange={(e) => setNewRule({ ...newRule, tier: e.target.value })}
              placeholder="e.g., Premium"
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Min Credit Score</label>
              <input
                type="number"
                value={newRule.minScore}
                onChange={(e) => setNewRule({ ...newRule, minScore: e.target.value })}
                placeholder="700"
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Max Credit Score</label>
              <input
                type="number"
                value={newRule.maxScore}
                onChange={(e) => setNewRule({ ...newRule, maxScore: e.target.value })}
                placeholder="850"
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={newRule.rate}
              onChange={(e) => setNewRule({ ...newRule, rate: e.target.value })}
              placeholder="e.g., 8.5"
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setShowAddRuleModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddRule}
              className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition"
            >
              Add Rule
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Interest Rule Modal */}
      <Modal open={showEditRuleModal} onClose={() => setShowEditRuleModal(false)} title="Edit Interest Rule" size="md">
        {editingRule && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Tier Name</label>
              <input
                type="text"
                value={editingRule.tier}
                onChange={(e) => setEditingRule({ ...editingRule, tier: e.target.value })}
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Min Credit Score</label>
                <input
                  type="number"
                  value={editingRule.minScore}
                  onChange={(e) => setEditingRule({ ...editingRule, minScore: parseInt(e.target.value) })}
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Max Credit Score</label>
                <input
                  type="number"
                  value={editingRule.maxScore}
                  onChange={(e) => setEditingRule({ ...editingRule, maxScore: parseInt(e.target.value) })}
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={editingRule.rate}
                onChange={(e) => setEditingRule({ ...editingRule, rate: e.target.value })}
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowEditRuleModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateRule}
                className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Penalty Settings Modal */}
      <Modal open={showEditPenaltyModal} onClose={() => setShowEditPenaltyModal(false)} title="Edit Penalty Settings" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Late Fee (% of EMI)</label>
            <input
              type="number"
              step="0.1"
              value={editingPenalty.lateFee}
              onChange={(e) => setEditingPenalty({ ...editingPenalty, lateFee: e.target.value })}
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Grace Period (days)</label>
            <input
              type="number"
              value={editingPenalty.gracePeriod}
              onChange={(e) => setEditingPenalty({ ...editingPenalty, gracePeriod: e.target.value })}
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Default Threshold (days)</label>
            <input
              type="number"
              value={editingPenalty.defaultThreshold}
              onChange={(e) => setEditingPenalty({ ...editingPenalty, defaultThreshold: e.target.value })}
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setShowEditPenaltyModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSavePenalty}
              className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SystemConfig;
