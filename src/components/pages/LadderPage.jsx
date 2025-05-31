import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const LadderPage = () => {
  const { tableId } = useParams();
  const [ladder, setLadder] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [selectedToRemove, setSelectedToRemove] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [removeSearchQuery, setRemoveSearchQuery] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username || !token) navigate('/login');
  }, [username, token, navigate]);

  useEffect(() => {
    const fetchLadder = async () => {
      try {
        const res = await axios.get(`https://backendcodeladder-2.onrender.com/ladder/${tableId}`, {
          headers: { Authorization: `Bearer ${token}`, 'x-username': username }
        });
        const ladderData = res.data;
        setLadder(ladderData);
        setIsAuthorized(ladderData.user?.includes(username));
        setError(!ladderData.user?.includes(username) ? 'Access denied' : null);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load ladder');
        setIsLoading(false);
      }
    };
    if (tableId && username && token) fetchLadder();
  }, [tableId, username, token]);

  useEffect(() => {
    if (!ladder?.questions || !isAuthorized) return;
    const fetchQuestions = async () => {
      try {
        const promises = ladder.questions.map(qId =>
          axios.get(`https://backendcodeladder-2.onrender.com/question/${qId}`, {
            headers: { Authorization: `Bearer ${token}`, 'x-username': username }
          }).then(res => res.data)
        );
        const results = await Promise.all(promises);
        setQuestions(results);
      } catch {
        setError('Failed to load questions');
      }
    };
    fetchQuestions();
  }, [ladder, isAuthorized, token, username]);

  const fetchAllQuestions = async () => {
    try {
      const res = await axios.get('https://backendcodeladder-2.onrender.com/problemset', {
        headers: { Authorization: `Bearer ${token}`, 'x-username': username }
      });
      setAllQuestions(res.data);
    } catch {
      setError('Failed to fetch questions');
    }
  };

  const handleMarkSolved = async (questionId) => {
    try {
      await axios.patch('https://backendcodeladder-2.onrender.com/markquestion',
        { questionid: questionId, user: username },
        { headers: { Authorization: `Bearer ${token}`, 'x-username': username } }
      );
      setQuestions(prev =>
        prev.map(q =>
          q.question_id === questionId
            ? { ...q, solved_by: [...(q.solved_by || []), username] }
            : q
        )
      );
    } catch {
      setError('Could not mark as solved');
    }
  };

  const handleUnmark = async (questionId) => {
    try {
      await axios.patch('https://backendcodeladder-2.onrender.com/unmarkquestion',
        { questionid: questionId, user: username },
        { headers: { Authorization: `Bearer ${token}`, 'x-username': username } }
      );
      setQuestions(prev =>
        prev.map(q =>
          q.question_id === questionId
            ? { ...q, solved_by: (q.solved_by || []).filter(u => u !== username) }
            : q
        )
      );
    } catch {
      setError('Could not unmark question');
    }
  };

  const handleAddToLadder = async () => {
    try {
      await axios.patch('https://backendcodeladder-2.onrender.com/edittable',
        {
          table_id: Number(tableId),
          questionIds: selectedToAdd,
          action: 'add',
        },
        { headers: { Authorization: `Bearer ${token}`, 'x-username': username } }
      );
      setShowAddModal(false);
      setSelectedToAdd([]);
      setSearchQuery('');
      setLadder(prev => ({ ...prev, questions: [...prev.questions, ...selectedToAdd] }));
    } catch {
      setError('Failed to add questions');
    }
  };

  const handleRemoveSelected = async () => {
    try {
      await axios.patch('https://backendcodeladder-2.onrender.com/edittable',
        {
          table_id: Number(tableId),
          questionIds: selectedToRemove,
          action: 'remove',
        },
        { headers: { Authorization: `Bearer ${token}`, 'x-username': username } }
      );
      setLadder(prev => ({
        ...prev,
        questions: prev.questions.filter(q => !selectedToRemove.includes(q)),
      }));
      setQuestions(prev => prev.filter(q => !selectedToRemove.includes(q.question_id)));
      setSelectedToRemove([]);
      setShowRemoveModal(false);
    } catch {
      setError('Failed to remove questions');
    }
  };

  const filteredQuestions = allQuestions
    .filter(q => !ladder?.questions.includes(q.question_id))
    .filter(q => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        q.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });

  const questionsToRemove = questions.filter(q => {
    if (!removeSearchQuery) return true;
    const query = removeSearchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      q.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to view this ladder.
          </p>
        </div>
      </div>
    );
  }

  const solvedCount = questions.filter(q => q.solved_by?.includes(username)).length;
  const totalCount = questions.length;
  const progressPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {ladder?.table_title || `Ladder ${tableId}`}
      </h1>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{solvedCount} of {totalCount} solved ({Math.round(progressPercentage)}%)</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 dark:bg-green-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { fetchAllQuestions(); setShowAddModal(true); }}
          className="btn-primary px-4 py-2 rounded text-sm"
        >
          Add Questions
        </button>
        <button
          onClick={() => setShowRemoveModal(true)}
          className="btn-secondary px-4 py-2 rounded text-sm"
          disabled={questions.length === 0}
        >
          Remove Questions
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">#</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Tags</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {questions.map((q, idx) => {
              const isSolved = q.solved_by?.includes(username);
              return (
                <tr key={q.question_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <a
                      href={q.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {q.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {q.tags?.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => isSolved ? handleUnmark(q.question_id) : handleMarkSolved(q.question_id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isSolved
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {isSolved ? 'Solved' : 'Mark Solved'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Questions Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Add Questions
            </h3>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="space-y-2 mb-4">
              {filteredQuestions.map(q => (
                <div
                  key={q.question_id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{q.title}</div>
                    <div className="flex gap-1 mt-1">
                      {q.tags?.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedToAdd.includes(q.question_id)}
                    onChange={() => setSelectedToAdd(prev =>
                      prev.includes(q.question_id)
                        ? prev.filter(id => id !== q.question_id)
                        : [...prev, q.question_id]
                    )}
                    className="ml-4"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToLadder}
                disabled={selectedToAdd.length === 0}
                className="btn-primary px-4 py-2 rounded text-sm"
              >
                Add Selected ({selectedToAdd.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Questions Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Remove Questions
            </h3>
            <input
              type="text"
              placeholder="Search questions..."
              value={removeSearchQuery}
              onChange={(e) => setRemoveSearchQuery(e.target.value)}
              className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="space-y-2 mb-4">
              {questionsToRemove.map(q => (
                <div
                  key={q.question_id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{q.title}</div>
                    <div className="flex gap-1 mt-1">
                      {q.tags?.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedToRemove.includes(q.question_id)}
                    onChange={() => setSelectedToRemove(prev =>
                      prev.includes(q.question_id)
                        ? prev.filter(id => id !== q.question_id)
                        : [...prev, q.question_id]
                    )}
                    className="ml-4"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSelected}
                disabled={selectedToRemove.length === 0}
                className="btn-secondary px-4 py-2 rounded text-sm"
              >
                Remove Selected ({selectedToRemove.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LadderPage;