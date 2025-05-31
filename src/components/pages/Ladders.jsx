import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Ladders() {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [ladders, setLadders] = useState([]);
  const [laddersWithProgress, setLaddersWithProgress] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLadderTitle, setNewLadderTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sourceTableId, setSourceTableId] = useState('');
  const [newTableTitle, setNewTableTitle] = useState('');
  const [copying, setCopying] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!username || !token) {
      navigate('/login');
      return;
    }
    fetchLadders();
  }, [username, token, navigate]);

  const fetchLadders = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        'https://backendcodeladder-2.onrender.com/ladders',
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username
          }
        }
      );
      setLadders(res.data);
      await fetchProgressForLadders(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load ladders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressForLadders = async (laddersList) => {
    try {
      const laddersWithProgressData = await Promise.all(
        laddersList.map(async (ladder) => {
          if (!ladder.questions || ladder.questions.length === 0) {
            return { ...ladder, solvedCount: 0, totalCount: 0, progressPercentage: 0 };
          }
          
          const questionPromises = ladder.questions.map(qId =>
            axios.get(`https://backendcodeladder-2.onrender.com/question/${qId}`, {
              headers: { Authorization: `Bearer ${token}`, 'x-username': username }
            }).then(res => res.data).catch(() => null)
          );
          
          const questions = await Promise.all(questionPromises);
          const validQuestions = questions.filter(q => q !== null);
          const solvedCount = validQuestions.filter(q => q.solved_by?.includes(username)).length;
          const totalCount = validQuestions.length;
          const progressPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

          return { ...ladder, solvedCount, totalCount, progressPercentage };
        })
      );
      setLaddersWithProgress(laddersWithProgressData);
    } catch (err) {
      setLaddersWithProgress(laddersList.map(ladder => ({
        ...ladder,
        solvedCount: 0,
        totalCount: ladder.questions?.length || 0,
        progressPercentage: 0
      })));
    }
  };

  const handleCreateLadder = async (e) => {
    e?.preventDefault();
    const trimmedTitle = newLadderTitle.trim();

    if (!trimmedTitle || trimmedTitle.length < 3) {
      setError('Ladder name must be at least 3 characters long');
      return;
    }

    try {
      setCreating(true);
      await axios.post(
        'https://backendcodeladder-2.onrender.com/createtable',
        { table_title: trimmedTitle, user: username },
        { headers: { Authorization: `Bearer ${token}`, 'x-username': username } }
      );
      setShowCreateModal(false);
      setNewLadderTitle('');
      await fetchLadders();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ladder');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLadder = async (e) => {
    e?.preventDefault();
    const trimmedSourceId = sourceTableId.trim();
    const trimmedTitle = newTableTitle.trim();

    if (!trimmedSourceId || !trimmedTitle || trimmedTitle.length < 3) {
      setError('Please fill all fields correctly');
      return;
    }

    try {
      setCopying(true);
      await axios.post(
        'https://backendcodeladder-2.onrender.com/copytable',
        {
          source_table_id: trimmedSourceId,
          new_table_title: trimmedTitle,
          new_user_id: username
        },
        { headers: { Authorization: `Bearer ${token}`, 'x-username': username } }
      );
      setShowCopyModal(false);
      setSourceTableId('');
      setNewTableTitle('');
      await fetchLadders();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to copy ladder');
    } finally {
      setCopying(false);
    }
  };

  const handleDeleteLadder = async (tableId, tableName) => {
    if (!window.confirm(`Delete "${tableName}"?`)) return;

    try {
      setDeleting(tableId);
      await axios.delete(
        'https://backendcodeladder-2.onrender.com/deleteladder',
        {
          data: { table_id: tableId, user_id: username },
          headers: { Authorization: `Bearer ${token}`, 'x-username': username }
        }
      );
      await fetchLadders();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete ladder');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Ladders</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCopyModal(true)}
            className="btn-secondary px-4 py-2 rounded-lg text-sm"
          >
            Copy Ladder
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-4 py-2 rounded-lg text-sm"
          >
            Create New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {laddersWithProgress.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No ladders found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {laddersWithProgress.map(ladder => (
            <div
              key={ladder.table_id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {ladder.table_title}
                </h3>
                <button
                  onClick={() => handleDeleteLadder(ladder.table_id, ladder.table_title)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  disabled={deleting === ladder.table_id}
                >
                  {deleting === ladder.table_id ? '...' : 'Delete'}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span>{ladder.totalCount} questions</span>
                <span>•</span>
                <span>{ladder.solvedCount} solved</span>
              </div>

              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-green-500 dark:bg-green-600 transition-all duration-300"
                  style={{ width: `${ladder.progressPercentage}%` }}
                ></div>
              </div>

              <button
                onClick={() => navigate(`/ladder/${ladder.table_id}`)}
                className="mt-4 w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                View Ladder
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Create New Ladder
            </h3>
            <form onSubmit={handleCreateLadder}>
              <input
                type="text"
                value={newLadderTitle}
                onChange={(e) => setNewLadderTitle(e.target.value)}
                placeholder="Ladder name"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary px-4 py-2 rounded text-sm"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Copy Ladder
            </h3>
            <form onSubmit={handleCopyLadder}>
              <input
                type="text"
                value={sourceTableId}
                onChange={(e) => setSourceTableId(e.target.value)}
                placeholder="Source ladder ID"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
              />
              <input
                type="text"
                value={newTableTitle}
                onChange={(e) => setNewTableTitle(e.target.value)}
                placeholder="New ladder name"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={copying}
                  className="btn-primary px-4 py-2 rounded text-sm"
                >
                  {copying ? 'Copying...' : 'Copy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ladders;