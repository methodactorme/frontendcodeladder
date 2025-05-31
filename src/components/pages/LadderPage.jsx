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
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabSearchQuery, setCollabSearchQuery] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');
  const [collabMessage, setCollabMessage] = useState('');
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

  const handleAddCollaborator = async () => {
    if (!newCollaborator.trim()) return;
    try {
      await axios.post('https://backendcodeladder-2.onrender.com/collabtable', {
        source_table_id: Number(tableId),
        new_user_id: newCollaborator.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}`, 'x-username': username }
      });
      setCollabMessage(`✅ ${newCollaborator} added successfully!`);
      setNewCollaborator('');
      const ladderRes = await axios.get(`https://backendcodeladder-2.onrender.com/ladder/${tableId}`, {
        headers: { Authorization: `Bearer ${token}`, 'x-username': username }
      });
      setLadder(ladderRes.data);
    } catch (err) {
      setCollabMessage(`❌ ${err.response?.data?.error || 'Failed to add collaborator'}`);
    }
  };

  const handleRemoveCollaborator = async (userToRemove) => {
    try {
      const response = await axios.post('https://backendcodeladder-2.onrender.com/removecollab', {
        source_table_id: ladder.table_id,
        user_to_remove: userToRemove
      }, {
        headers: { Authorization: `Bearer ${token}`, 'x-username': username }
      });
      setLadder(prev => ({ ...prev, user: response.data.users }));
      setCollabMessage(`✅ Removed ${userToRemove} successfully`);
    } catch (err) {
      setCollabMessage(`❌ ${err.response?.data?.error || 'Failed to remove collaborator'}`);
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
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/ladders')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to Ladders
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {ladder?.table_title || `Ladder ${tableId}`}
        </h1>
        <div className="w-[72px]"></div>
      </div>

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
        <button
          onClick={() => setShowCollabModal(true)}
          className="btn-accent px-4 py-2 rounded text-sm"
        >
          Manage Collaborators
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

      {/* Collaborators Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Manage Collaborators
            </h3>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Current Collaborators</h4>
              <div className="space-y-2">
                {ladder?.user?.map((user, idx) => (
                  <div key={user} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{user}</span>
                      {idx === 0 && <span className="ml-2 text-blue-600 dark:text-blue-400">(Owner)</span>}
                      {user === username && <span className="ml-2 text-green-600 dark:text-green-400">(You)</span>}
                    </div>
                    {ladder.user[0] === username && idx !== 0 && (
                      <button
                        onClick={() => handleRemoveCollaborator(user)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {ladder?.user[0] === username && (
              <div className="border-t dark:border-gray-700 pt-4">
                <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Add New Collaborator</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    placeholder="Enter username"
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={handleAddCollaborator}
                    className="btn-primary px-4 py-2 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
                {collabMessage && (
                  <p className={`mt-2 text-sm ${collabMessage.startsWith('✅') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {collabMessage}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowCollabModal(false);
                  setCollabMessage('');
                  setNewCollaborator('');
                }}
                className="btn-secondary px-4 py-2 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LadderPage;