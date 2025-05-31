import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser('');
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-gray-800 dark:to-gray-900 py-4 px-6 shadow-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Menu Button */}
        <div className="flex items-center justify-between md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <button
            onClick={toggleDarkMode}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-white/80 font-bold text-xl transition-colors">
              CodeLadder
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-white/80 transition-colors">
                Home
              </Link>
              <Link to="/problemset" className="text-white hover:text-white/80 transition-colors">
                Problemset
              </Link>
              <Link to="/ladders" className="text-white hover:text-white/80 transition-colors">
                Ladders
              </Link>
              {user === "admin" && (
                <Link to="/admin" className="text-yellow-300 hover:text-yellow-200 transition-colors">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={toggleDarkMode}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user && user !== 'Guest' ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">
                  <span className="inline-block w-8 h-8 rounded-full bg-white/20 text-white text-lg font-bold flex items-center justify-center">
                    {user[0]?.toUpperCase()}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="flex flex-col space-y-4 pt-4">
            <Link to="/" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/problemset" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              Problemset
            </Link>
            <Link to="/ladders" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              Ladders
            </Link>
            {user === "admin" && (
              <Link to="/admin" className="text-yellow-300 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                Admin
              </Link>
            )}
            {user && user !== 'Guest' ? (
              <button
                onClick={handleLogout}
                className="text-white hover:bg-white/10 px-4 py-2 rounded-lg text-left transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;