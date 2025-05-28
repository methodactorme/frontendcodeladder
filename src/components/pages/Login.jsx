import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// AuthForm handles both Login and Signup in a single sleek component
const AuthForm = ({ setUser, mode = "login" }) => {
  const [formMode, setFormMode] = useState(mode); // "login" or "signup"
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle login/registration form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess('');

    if (formMode === 'signup') {
      // Signup logic
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
      // Login logic
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

  // Switch between login and signup
  const handleModeSwitch = () => {
    setFormMode(formMode === 'login' ? 'signup' : 'login');
    setMessage('');
    setSuccess('');
    setFormData({ username: '', password: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 tracking-tight text-center">
          {formMode === 'login' ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder={formMode === 'login' ? "Username or Email" : "Username"}
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none transition"
            autoFocus
          />
          {formMode === 'signup' && (
            <>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none transition"
              />
            </>
          )}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none transition"
          />
          {formMode === 'signup' && (
            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none transition"
            />
          )}

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg shadow hover:from-blue-600 hover:to-blue-900 transition"
          >
            {formMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {(message || success) && (
          <div className="mt-5 text-center text-lg font-medium">
            {message && <p className="text-red-600">{message}</p>}
            {success && <p className="text-green-600">{success}</p>}
          </div>
        )}

        <div className="mt-8 text-center">
          <span className="text-gray-600">
            {formMode === 'login'
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <button
            onClick={handleModeSwitch}
            className="ml-2 font-semibold text-blue-700 hover:underline focus:outline-none"
          >
            {formMode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;