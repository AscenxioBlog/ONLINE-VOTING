import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { getPosts, getCandidates, deletePost, deleteCandidate, setVotingSettings, getVotingSettings } from '../services/firebaseService';
import { ArrowLeft, Plus, Users, UserCheck, Trash2, Clock, Settings, RotateCcw } from 'lucide-react';
import TestData from '../components/TestData';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [votingSettings, setVotingSettingsState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVotingSettings, setShowVotingSettings] = useState(false);
  const [votingStart, setVotingStart] = useState('');
  const [votingEnd, setVotingEnd] = useState('');
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === null) return; // Wait for role to load
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    fetchData();
  }, [userRole, navigate]);

  const fetchData = async () => {
    try {
      console.log('Admin fetching data...');
      
      const [postsData, candidatesData, votersSnapshot, settings] = await Promise.all([
        getPosts(),
        getCandidates(),
        getDocs(collection(db, 'users')),
        getVotingSettings()
      ]);

      console.log('Admin fetched:', { postsData, candidatesData: candidatesData.length, settings });

      const votersData = votersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(user => user.role === 'voter');

      setPosts(postsData);
      setCandidates(candidatesData);
      setVoters(votersData);
      setVotingSettingsState(settings);
      
      if (settings) {
        setVotingStart(settings.votingStart?.toDate().toISOString().slice(0, 16) || '');
        setVotingEnd(settings.votingEnd?.toDate().toISOString().slice(0, 16) || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? All candidates under this post will also be deleted.')) {
      try {
        await deletePost(postId);
        setPosts(posts.filter(p => p.id !== postId));
        setCandidates(candidates.filter(c => c.postId !== postId));
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Error deleting post');
      }
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await deleteCandidate(candidateId);
        setCandidates(candidates.filter(c => c.id !== candidateId));
        toast.success('Candidate deleted successfully');
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error('Error deleting candidate');
      }
    }
  };

  const handleSaveVotingSettings = async () => {
    if (!votingStart || !votingEnd) {
      toast.error('Please set both start and end times');
      return;
    }
    
    try {
      await setVotingSettings({
        votingStart: new Date(votingStart),
        votingEnd: new Date(votingEnd)
      });
      toast.success('Voting settings saved successfully');
      setShowVotingSettings(false);
      fetchData();
    } catch (error) {
      console.error('Error saving voting settings:', error);
      toast.error('Error saving voting settings');
    }
  };

  const handleResetVoting = async () => {
    if (window.confirm('Are you sure you want to reset all voting data? This will clear all votes and reset candidate vote counts. This action cannot be undone.')) {
      try {
        const batch = writeBatch(db);
        
        // Reset all candidate vote counts
        candidates.forEach(candidate => {
          const candidateRef = doc(db, 'candidates', candidate.id);
          batch.update(candidateRef, { voteCount: 0 });
        });
        
        // Reset all user voting status
        voters.forEach(voter => {
          const voterRef = doc(db, 'users', voter.id);
          batch.update(voterRef, { hasVoted: false });
        });
        
        // Delete all votes
        const votesSnapshot = await getDocs(collection(db, 'votes'));
        votesSnapshot.docs.forEach(voteDoc => {
          batch.delete(doc(db, 'votes', voteDoc.id));
        });
        
        await batch.commit();
        
        // Refresh data
        await fetchData();
        
        toast.success('Voting data reset successfully');
      } catch (error) {
        console.error('Error resetting voting data:', error);
        toast.error('Error resetting voting data');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const votedCount = voters.filter(voter => voter.hasVoted).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div></div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="card bg-[peru] text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Settings className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{posts.length}</h3>
                <p className="text-gray-600">Posts</p>
              </div>
            </div>
          </div>

          <div className="card bg-[#7dcd3f] text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{candidates.length}</h3>
                <p className="text-gray-600">Candidates</p>
              </div>
            </div>
          </div>

          <div className="card bg-[#33446b] text-white p-6 rounded-lg shadow-lg" >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{voters.length}</h3>
                <p className="text-gray-600">Registered Voters</p>
              </div>
            </div>
          </div>

          <div className="card bg-[#211407] text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{votedCount}</h3>
                <p className="text-white">Votes Cast</p>
              </div>
            </div>
          </div>

          <div className="card bg-[#cd3fba] text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{voters.length - votedCount}</h3>
                <p className="text-gray-600">Pending Votes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Data Component */}
        <TestData />

        {/* Action Buttons */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Link to="/admin/add-post" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center py-6">
              <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Post</h3>
              <p className="text-gray-600">Add new election posts</p>
            </div>
          </Link>

          <Link to="/admin/add-candidate" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center py-6">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Candidate</h3>
              <p className="text-gray-600">Add candidates to posts</p>
            </div>
          </Link>

          <button 
            onClick={() => setShowVotingSettings(true)}
            className="card hover:shadow-xl transition-shadow cursor-pointer text-left"
          >
            <div className="text-center py-6">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Voting Time</h3>
              <p className="text-gray-600">Set voting start/end time</p>
            </div>
          </button>

          <Link to="/admin/voters" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center py-6">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Voters</h3>
              <p className="text-gray-600">View registered voters</p>
            </div>
          </Link>

          <button onClick={handleResetVoting} className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center py-6">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RotateCcw className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Voting</h3>
              <p className="text-gray-600">Clear all votes and reset</p>
            </div>
          </button>
        </div>

        {/* Posts and Candidates */}
        <div className="space-y-8">
          {/* Posts List */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Election Posts</h2>
              <Link to="/admin/add-post" className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Post</span>
              </Link>
            </div>

            {posts.length > 0 ? (
              <div className="grid gap-4">
                {posts.map(post => {
                  const postCandidates = candidates.filter(c => c.postId === post.id);
                  return (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                          <p className="text-sm text-gray-600">{postCandidates.length} candidates</p>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {postCandidates.length > 0 && (
                        <div className="space-y-2">
                          {postCandidates.map(candidate => (
                            <div key={candidate.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <div>
                                <span className="font-medium text-gray-900">{candidate.name}</span>
                                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  {candidate.voteCount || 0} votes
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteCandidate(candidate.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No posts added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Voting Settings Modal */}
        {showVotingSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Time Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voting Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={votingStart}
                    onChange={(e) => setVotingStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voting End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={votingEnd}
                    onChange={(e) => setVotingEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveVotingSettings}
                  className="flex-1 btn-primary"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowVotingSettings(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;