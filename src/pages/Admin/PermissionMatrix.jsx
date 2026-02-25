import { useState } from 'react';
import { useToast } from '../../context/AppContext';

const PermissionMatrix = () => {
  const { addToast } = useToast();
  
  const roles = ['Admin', 'Lender', 'Analyst', 'Borrower'];
  const permissions = ['Create', 'Edit', 'Approve', 'Delete'];

  const [permissionMatrix, setPermissionMatrix] = useState({
    'Admin': { 'Create': true, 'Edit': true, 'Approve': true, 'Delete': true },
    'Lender': { 'Create': true, 'Edit': true, 'Approve': true, 'Delete': false },
    'Analyst': { 'Create': false, 'Edit': false, 'Approve': false, 'Delete': false },
    'Borrower': { 'Create': true, 'Edit': true, 'Approve': false, 'Delete': false }
  });

  const togglePermission = (role, permission) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission]
      }
    }));
  };

  const handleEnableAll = () => {
    const updated = {};
    roles.forEach(role => {
      updated[role] = {};
      permissions.forEach(perm => {
        updated[role][perm] = true;
      });
    });
    setPermissionMatrix(updated);
    addToast('success', 'All Enabled', 'All permissions have been enabled');
  };

  const handleDisableAll = () => {
    const updated = {};
    roles.forEach(role => {
      updated[role] = {};
      permissions.forEach(perm => {
        updated[role][perm] = false;
      });
    });
    setPermissionMatrix(updated);
    addToast('info', 'All Disabled', 'All permissions have been disabled');
  };

  const handleSaveChanges = () => {
    addToast('success', 'Changes Saved', 'Permission matrix has been updated successfully');
  };

  const handleEditRoles = (user) => {
    addToast('info', 'Edit Roles', `Editing roles for ${user}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Role & Permission Editor</h2>
        <p className="text-sm text-slate-500">Assign multiple roles and fine-grained access.</p>
      </header>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Bulk actions</h3>
            <p className="text-xs text-slate-600">Apply policy changes across roles.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleEnableAll}
              className="px-3 py-2 rounded-lg border border-teal-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
            >
              Enable all
            </button>
            <button 
              onClick={handleDisableAll}
              className="px-3 py-2 rounded-lg border border-teal-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
            >
              Disable all
            </button>
            <button 
              onClick={handleSaveChanges}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs font-semibold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20"
            >
              Save changes
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-slate-600 uppercase">
              <tr className="border-b border-teal-100">
                <th className="py-2 font-semibold text-slate-900">Role</th>
                {permissions.map((perm) => (
                  <th key={perm} className="py-2 font-semibold text-slate-900">{perm}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-100">
              {roles.map((role) => (
                <tr key={role}>
                  <td className="py-3 font-semibold">{role}</td>
                  {permissions.map((perm) => (
                    <td key={`${role}-${perm}`} className="py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={permissionMatrix[role]?.[perm] || false}
                          onChange={() => togglePermission(role, perm)}
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition" />
                        <div className="absolute left-1 top-1 h-3 w-3 bg-white rounded-full transition peer-checked:translate-x-5" />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-semibold text-slate-900">Assign multiple roles</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Alicia Stone', 'Mark Faraday', 'Devon Miles'].map((user) => (
            <div key={user} className="border border-teal-100 rounded-xl p-4 hover:bg-teal-50 hover:border-teal-200 transition">
              <p className="text-sm font-semibold text-slate-900">{user}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roles.slice(0, 2).map((role) => (
                  <span key={`${user}-${role}`} className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-semibold">
                    {role}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => handleEditRoles(user)}
                className="mt-4 text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
              >
                Edit roles
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PermissionMatrix;
