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
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 50;
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
      setError('❌ Could not mark as solved');
      setTimeout(() => setError(''), 3000);
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
      setError('❌ Could not unmark the question');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRandomUnsolved = () => {
    const unsolved = questions.filter(
      q => !(Array.isArray(q.solved_by) && q.solved_by.includes(username))
    );
    if (unsolved.length === 0) {
      setError("✅ You've solved all problems!");
      setTimeout(() => setError(''), 3000);
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

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const currentQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const isQuestionSolved = (question) =>
    Array.isArray(question.solved_by) &&
    username &&
    question.solved_by.includes(username);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8 card animate-fade-in">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 tracking-tight text-center">
        🧠 Problemset
      </h2>

      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 font-semibold border border-red-200 dark:border-red-800 text-center animate-slide-up">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search problems by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-grow"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setHideSolved(!hideSolved)}
            className={`btn ${hideSolved ? 'btn-secondary' : 'btn-danger'}`}
          >
            {hideSolved ? '👁️ Show Solved' : '❌ Hide Solved'}
          </button>
          <button
            onClick={handleRandomUnsolved}
            className="btn btn-primary"
          >
            🎲 Random
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="table-header w-16">#</th>
              <th className="table-header w-2/5">Title</th>
              <th className="table-header w-2/5">Tags</th>
              <th className="table-header w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentQuestions.map((q, idx) => {
              const isSolved = isQuestionSolved(q);
              const actualIndex = (currentPage - 1) * questionsPerPage + idx + 1;
              return (
                <tr
                  key={q.question_id}
                  className={`${isSolved ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-900'} 
                    hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200`}
                >
                  <td className="table-cell font-mono text-sm text-gray-500 dark:text-gray-400">
                    {actualIndex}
                  </td>
                  <td className="table-cell">
                    <a
                      href={q.link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      {q.title}
                    </a>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {q.tags && q.tags.length > 0 ? (
                        q.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">No tags</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => isSolved ? handleUnmark(q.question_id) : handleMarkSolved(q.question_id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                        ${isSolved 
                          ? 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white' 
                          : 'border-2 border-primary-500 dark:border-primary-400 hover:bg-primary-500 dark:hover:bg-primary-600 hover:text-white text-primary-500 dark:text-primary-400'}`}
                      title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                    >
                      {isSolved ? '✓' : '○'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Problemset;