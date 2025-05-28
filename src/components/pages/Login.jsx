import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ setUser, mode = "login" }) => {
  const [formMode, setFormMode] = useState(mode);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess('');

    if (formMode === 'signup') {
      try {
        const res = await axios.post('https://backendcodeladder-2.onrender.com/authen/signup', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
        setSuccess(res.data.message || 'Signup successful!');
        setUser(res.data.user.username);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.user.username);
        setTimeout(() => navigate('/'), 1000);
      } catch (err) {
        setMessage(err.response?.data?.error || "Something went wrong");
      }
    } else {
      try {
        const response = await axios.post(
          'https://backendcodeladder-2.onrender.com/authen/login',
          {
            username: formData.username,
            password: formData.password,
          }
        );
        setUser(response.data.user.username);
        localStorage.setItem('username', response.data.user.username);
        localStorage.setItem('token', response.data.token);
        setSuccess('Login successful!');
        setFormData({ username: '', password: '', email: '', phone: '' });
        setTimeout(() => navigate('/home'), 700);
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.error || 'Login failed');
        } else {
          setMessage('Server error');
        }
      }
    }
  };

  const handleModeSwitch = () => {
    setFormMode(formMode === 'login' ? 'signup' : 'login');
    setMessage('');
    setSuccess('');
    setFormData({ username: '', password: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.pexels.com/photos/2653362/pexels-photo-2653362.jpeg')] bg-cover bg-center">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-2">
            {formMode === 'login' ? 'Welcome Back!' : 'Join Us'}
          </h2>
          <p className="text-gray-600">
            {formMode === 'login' 
              ? 'Sign in to continue your journey' 
              : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="username"
              type="text"
              placeholder={formMode === 'login' ? "Username or Email" : "Username"}
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              autoFocus
            />
          </div>

          {formMode === 'signup' && (
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          )}

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          {formMode === 'signup' && (
            <div>
              <input
                name="phone"
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition transform hover:scale-105"
          >
            {formMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {(message || success) && (
          <div className="mt-4 text-center text-sm font-medium">
            {message && <p className="text-red-600">{message}</p>}
            {success && <p className="text-green-600">{success}</p>}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {formMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={handleModeSwitch}
              className="ml-2 font-semibold text-blue-700 hover:text-blue-900 hover:underline focus:outline-none"
            >
              {formMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;