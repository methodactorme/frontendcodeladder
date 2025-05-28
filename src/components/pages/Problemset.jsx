import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Problemset() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [hideSolved, setHideSolved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    const storedToken = localStorage.getItem('token');
    if (!storedUser || !storedToken) {
      navigate('/login');
    } else {
      setUsername(storedUser);
      setToken(storedToken);

      const fetchQuestions = async () => {
        try {
          // If your /problemset route is protected, add headers here as well
          const response = await axios.get('https://backendcodeladder-2.onrender.com/problemset', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'x-username': storedUser,
            },
          });
          setQuestions(response.data);
        } catch (err) {
          setError('❌ Failed to load questions');
        }
      };
      fetchQuestions();
    }
  }, [navigate]);

  const handleMarkSolved = async (questionId) => {
    try {
      await axios.patch(
        'https://backendcodeladder-2.onrender.com/markquestion',
        {
          questionid: questionId,
          user: username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username,
          },
        }
      );
      setQuestions(prev =>
        prev.map(q =>
          q.question_id === questionId
            ? { ...q, solved_by: [...(Array.isArray(q.solved_by) ? q.solved_by : []), username] }
            : q
        )
      );
    } catch (err) {
      alert('❌ Could not mark as solved');
    }
  };

  const handleUnmark = async (questionId) => {
    try {
      await axios.patch(
        'https://backendcodeladder-2.onrender.com/unmarkquestion',
        {
          questionid: questionId,
          user: username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username,
          },
        }
      );
      setQuestions(prev =>
        prev.map(q =>
          q.question_id === questionId
            ? { ...q, solved_by: (Array.isArray(q.solved_by) ? q.solved_by : []).filter(u => u !== username) }
            : q
        )
      );
    } catch (err) {
      alert('❌ Could not unmark the question');
    }
  };

  const handleToggleSolved = () => {
    setHideSolved(prev => !prev);
  };

  const handleRandomUnsolved = () => {
    const unsolved = questions.filter(
      q => !(Array.isArray(q.solved_by) && q.solved_by.includes(username))
    );
    if (unsolved.length === 0) {
      alert("✅ You've solved all problems!");
      return;
    }
    const random = unsolved[Math.floor(Math.random() * unsolved.length)];
    window.open(random.link, '_blank');
  };

  const filteredQuestions = questions
    .filter(q => q.title.toLowerCase().includes(search.toLowerCase()))
    .filter(q =>
      !hideSolved ||
      !(Array.isArray(q.solved_by) && q.solved_by.includes(username))
    );

  const isQuestionSolved = (question) =>
    Array.isArray(question.solved_by) &&
    username &&
    question.solved_by.includes(username);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg min-h-[60vh] font-inter">
      <h2 className="text-3xl font-extrabold text-blue-900 mb-6 tracking-tight text-center">
        🧠 Problemset
      </h2>

      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-700 font-semibold border border-red-200 text-center">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="🔍 Search problems by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="block w-full mb-6 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none text-lg"
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:justify-start gap-4">
        <button
          onClick={handleToggleSolved}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1 transition
            ${hideSolved
              ? 'bg-gray-500 hover:bg-gray-700 text-white'
              : 'bg-red-500 hover:bg-red-700 text-white'}
          `}
        >
          {hideSolved ? '👁️ Show Solved' : '❌ Hide Solved'}
        </button>
        <button
          onClick={handleRandomUnsolved}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 transition"
        >
          🎲 Random Unsolved
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="w-full table-fixed min-w-[900px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-16">#</th>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-2/6">Title</th>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-2/6">Tags</th>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400 text-lg">
                  No matching questions found.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isSolved = isQuestionSolved(q);
                return (
                  <tr
                    key={q.question_id}
                    className={isSolved ? "bg-green-50" : "bg-white"}
                    style={{ height: "44px" }}
                  >
                    <td className="py-1 px-4 align-middle font-mono text-sm text-gray-500">{idx + 1}</td>
                    <td className="py-1 px-4 align-middle">
                      <a
                        href={q.link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-800 hover:text-blue-600 transition"
                      >
                        {q.title}
                      </a>
                    </td>
                    <td className="py-1 px-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {q.tags && q.tags.length > 0 ? (
                          q.tags.map(tag =>
                            <span key={tag} className="inline-block bg-blue-100 text-blue-900 rounded-full text-xs px-2 py-0.5 font-medium">{tag}</span>
                          )
                        ) : (
                          <span className="text-gray-400 text-base">No tags</span>
                        )}
                      </div>
                    </td>
                    <td className="py-1 px-4 align-middle">
                      <button
                        onClick={() =>
                          isSolved
                            ? handleUnmark(q.question_id)
                            : handleMarkSolved(q.question_id)
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center
                          ${isSolved
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'border border-blue-400 bg-white hover:bg-blue-500 hover:text-white text-blue-500'}
                          transition focus:outline-none`}
                        title={isSolved ? 'Unmark as Solved' : 'Mark as Solved'}
                      >
                        {isSolved ? (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7.629 14.996a1 1 0 01-.706-.293l-3.63-3.63a1 1 0 111.414-1.414l2.923 2.924 6.293-6.293a1 1 0 111.414 1.414l-7 7a1 1 0 01-.708.292z"/></svg>
                        ) : (
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-5 h-5"><circle cx="10" cy="10" r="8" strokeWidth="2" /><circle cx="10" cy="10" r="4" strokeWidth="2" /></svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Problemset;