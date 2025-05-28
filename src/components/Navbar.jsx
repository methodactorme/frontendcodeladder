import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setUser('');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 py-4 px-6 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* User display */}
        <div className="flex items-center gap-3">
          <span className="text-white text-xl font-bold tracking-wide select-none">
            {user && user !== 'Guest' ? (
              <span className="flex items-center">
                <span className="inline-block w-8 h-8 mr-2 rounded-full bg-blue-300 text-blue-900 text-lg font-bold flex items-center justify-center">
                  {user[0]?.toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user}</span>
              </span>
            ) : (
              <span className="flex items-center">
                <span className="inline-block w-8 h-8 mr-2 rounded-full bg-gray-200 text-gray-700 text-lg font-bold flex items-center justify-center">
                  G
                </span>
                <span className="hidden sm:inline">Guest</span>
              </span>
            )}
          </span>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center">
          <Link to="/" className="text-white hover:text-blue-200 font-semibold transition px-3 py-1 rounded-lg hover:bg-blue-800">
            Home
          </Link>
          <Link to="/problemset" className="text-white hover:text-blue-200 font-semibold transition px-3 py-1 rounded-lg hover:bg-blue-800">
            Problemset
          </Link>
          <Link to="/ladders" className="text-white hover:text-blue-200 font-semibold transition px-3 py-1 rounded-lg hover:bg-blue-800">
            Ladders
          </Link>
          {user === "admin" && (
            <Link to="/admin" className="text-yellow-300 hover:text-yellow-200 font-semibold transition px-3 py-1 rounded-lg hover:bg-blue-800">
              Admin
            </Link>
          )}
          {(!user || user === 'Guest') && (
            <Link to="/login" className="text-white hover:text-blue-200 font-semibold transition px-3 py-1 rounded-lg hover:bg-blue-800">
              Login
            </Link>
          )}
        </div>

        {/* Logout */}
        <div className="flex justify-center">
          {user && user !== '' && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-bold shadow-lg hover:from-red-700 hover:to-red-900 transition transform hover:scale-105"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
