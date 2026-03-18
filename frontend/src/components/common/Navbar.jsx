import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';
import {
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-primary-700 bg-primary-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <ChatBubbleLeftRightIcon className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <span className="flex items-center space-x-1.5">
                    <Squares2X2Icon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </span>
                </Link>
                <Link to="/blog/new" className={navLinkClass('/blog/new')}>
                  <span className="flex items-center space-x-1.5">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Blog Generator</span>
                  </span>
                </Link>
                <Link to="/blogs" className={navLinkClass('/blogs')}>
                  My Blogs
                </Link>

                <div className="w-px h-6 bg-gray-200 mx-2" />

                <span className="text-sm text-gray-500 px-2">
                  <span className="font-medium text-gray-700">{user?.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3 space-y-1 shadow-lg">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Squares2X2Icon className="h-5 w-5 text-gray-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/blog/new"
                className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                <span>Blog Generator</span>
              </Link>
              <Link
                to="/blogs"
                className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                <span>My Blogs</span>
              </Link>
              <div className="border-t border-gray-100 my-2" />
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="block bg-gray-900 text-white text-center px-3 py-2.5 rounded-lg text-sm font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
