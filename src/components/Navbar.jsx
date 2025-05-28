import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setUser('Guest');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 py-3 px-6 shadow-lg flex items-center justify-between font-inter">
      {/* User display */}
      <div className="flex items-center gap-3">
        <span className="text-white text-xl font-bold tracking-wide select-none">
          {user && user !== 'Guest' ? (
            <span>
              <span className="inline-block w-7 h-7 mr-2 rounded-full bg-blue-400 text-blue-900 text-lg font-bold text-center align-middle">
                {user[0]?.toUpperCase()}
              </span>
              {user}
            </span>
          ) : (
            <span>
              <span className="inline-block w-7 h-7 mr-2 rounded-full bg-gray-200 text-gray-700 text-lg font-bold text-center align-middle">
                G
              </span>
              Guest
            </span>
          )}
        </span>
      </div>
      {/* Nav links */}
      <div className="flex gap-6 items-center">
        <Link to="/" className="text-white hover:text-blue-200 font-semibold transition">
          Home
        </Link>
        <Link to="/problemset" className="text-white hover:text-blue-200 font-semibold transition">
          Problemset
        </Link>
        
        <Link to="/ladders" className="text-white hover:text-blue-200 font-semibold transition">
          Ladders
        </Link>
        {user === "admin" && (
          <Link to="/admin" className="text-white hover:text-yellow-300 font-semibold transition">
            Admin
          </Link>
        )}
        {(!user || user === 'Guest') && (
          <Link
            to="/login"
            className="text-white hover:text-blue-200 font-semibold transition"
          >
            Login
          </Link>
        )}
      </div>
      {/* Logout */}
      <div>
        {user && user !== 'Guest' && (
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-bold shadow hover:from-red-600 hover:to-red-900 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;