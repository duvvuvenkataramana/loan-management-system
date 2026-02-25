import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Filter, Sun, Moon, Menu, X, User, LogOut, Settings } from 'lucide-react';

const TopBar = ({
  user,
  logout,
  onToggleSidebar,
  isSidebarCollapsed,
  onToggleNotifications,
  onToggleFilters,
  onToggleTheme,
  theme,
  primaryAction,
  unreadCount,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleProfileSettings = () => {
    setMenuOpen(false);
    alert('Profile & Settings page - Coming soon!');
  };

  const handlePreferences = () => {
    setMenuOpen(false);
    alert('Preferences page - Coming soon!');
  };

  return (
    <header className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 sticky top-0 z-30 border-b border-teal-100/50 dark:border-teal-800/50 backdrop-blur-sm shadow-sm">
      <div className="h-20 px-8 flex items-center justify-between gap-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions, borrowers, loans..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-teal-200 dark:border-teal-700 rounded-2xl px-10 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Filter button */}
          <button
            onClick={onToggleFilters}
            className="h-10 px-3.5 rounded-xl border border-teal-200 dark:border-teal-700 text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 flex items-center gap-2 text-sm font-medium transition-all duration-200"
          >
            <Filter size={16} />
            <span className="hidden md:inline">Filters</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onToggleNotifications}
            className="h-10 w-10 rounded-xl border border-teal-200 dark:border-teal-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 relative transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="h-10 w-10 rounded-xl border border-teal-200 dark:border-teal-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-teal-200/50" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-slate-100 transition-all duration-200"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-800 rounded-2xl shadow-lg overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="px-4 py-3 border-b border-teal-100 dark:border-teal-800 bg-slate-50 dark:bg-slate-900">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.role}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleProfileSettings}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-2 transition-all duration-200"
                  >
                    <User size={16} />
                    Profile & Settings
                  </button>
                  <button
                    onClick={handlePreferences}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-2 transition-all duration-200"
                  >
                    <Settings size={16} />
                    Preferences
                  </button>
                  <div className="my-1 border-t border-teal-100 dark:border-teal-800" />
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center gap-2 transition-all duration-200"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="h-10 w-10 rounded-xl border border-teal-200 dark:border-teal-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 lg:hidden transition-all duration-200"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Quick action - only show on larger screens */}
        {primaryAction && (
          <div className="hidden xl:block">
            <Link
              to={primaryAction.to}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white flex items-center gap-2 text-sm font-bold hover:from-teal-500 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-teal-500/20"
            >
              {primaryAction.label}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
