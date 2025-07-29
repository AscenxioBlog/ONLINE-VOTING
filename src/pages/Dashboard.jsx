import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getPosts, getCandidates, hasUserVoted, getVotingSettings, resetVoting } from '../services/firebaseService';
import { db } from '../firebase/config';
import { Vote, BarChart3, Users, LogOut, Settings, Clock, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalCandidates: 0,
    totalVoters: 0,
    hasVoted: false
  });
  const [votingSettings, setVotingSettings] = useState(null);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserInfo();
      fetchStats();
    }
  }, [currentUser]);

  const fetchUserInfo = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats for user:', currentUser.uid);
      
      const [postsData, candidatesData, usersSnapshot, votedStatus, settings] = await Promise.all([
        getPosts(),
        getCandidates(),
        getDocs(collection(db, 'users')),
        hasUserVoted(currentUser.uid),
        getVotingSettings()
      ]);

      console.log('Fetched data:', { postsData, candidatesData: candidatesData.length, settings });

      setStats({
        totalPosts: postsData.length,
        totalCandidates: candidatesData.length,
        totalVoters: usersSnapshot.size,
        hasVoted: votedStatus
      });
      
      setVotingSettings(settings);
      
      // Check if voting is currently active
      if (settings) {
        const now = new Date();
        const start = settings.votingStart?.toDate();
        const end = settings.votingEnd?.toDate();
        setIsVotingActive(now >= start && now <= end);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleResetVoting = async () => {
    if (window.confirm('Are you sure you want to reset all voting data? This action cannot be undone.')) {
      try {
        await resetVoting();
        toast.success('Voting data reset successfully');
        fetchStats(); // Refresh stats
      } catch (error) {
        toast.error('Error resetting voting data');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">E-Voting Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {userInfo?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-indigo-500 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.totalPosts}</h3>
                <p className="text-indigo-100">Election Posts</p>
              </div>
            </div>
          </div>

          <div className="card bg-green-500 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.totalCandidates}</h3>
                <p className="text-green-100">Total Candidates</p>
              </div>
            </div>
          </div>

          <div className="card bg-purple-500 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Vote className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.totalVoters}</h3>
                <p className="text-purple-100">Registered Voters</p>
              </div>
            </div>
          </div>

          <div className={`card p-6 rounded-lg shadow-lg ${stats.hasVoted ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Vote className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {stats.hasVoted ? 'Voted' : 'Not Voted'}
                </h3>
                <p className={stats.hasVoted ? 'text-green-100' : 'text-yellow-100'}>Your Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Status */}
        {votingSettings && (
          <div className="card mb-8">
            <div className="text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voting Period</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Starts:</span>
                  <div className="font-medium">{votingSettings.votingStart?.toDate().toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Ends:</span>
                  <div className="font-medium">{votingSettings.votingEnd?.toDate().toLocaleString()}</div>
                </div>
              </div>
              <div className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${
                isVotingActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isVotingActive ? 'Voting is Active' : 'Voting is Inactive'}
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {!stats.hasVoted && isVotingActive && (
            <Link to="/vote" className="card hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-center py-8">
                <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Vote className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cast Your Vote</h3>
                <p className="text-gray-600">Participate in the student election</p>
              </div>
            </Link>
          )}
          
          {!stats.hasVoted && !isVotingActive && (
            <div className="card bg-gray-100 cursor-not-allowed">
              <div className="text-center py-8">
                <div className="bg-gray-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Vote className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Voting Unavailable</h3>
                <p className="text-gray-400">Voting is not currently active</p>
              </div>
            </div>
          )}

          <Link to="/results" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center py-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">View Results</h3>
              <p className="text-gray-600">Check live election results</p>
            </div>
          </Link>

          {userRole === 'admin' && (
            <Link to="/admin" className="card hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-center py-8">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
                <p className="text-gray-600">Manage candidates and voters</p>
              </div>
            </Link>
          )}

          {userRole === 'admin' && (
            <button onClick={handleResetVoting} className="card hover:shadow-xl transition-shadow cursor-pointer bg-red-50 hover:bg-red-100">
              <div className="text-center py-8">
                <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <RotateCcw className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">Reset Voting</h3>
                <p className="text-red-600">Clear all votes and candidate records</p>
              </div>
            </button>
          )}
        </div>

        {stats.hasVoted && (
          <div className="mt-8 card bg-green-50 border-green-200">
            <div className="text-center py-4">
              <div className="text-green-600 mb-2">
                <Vote className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">Thank you for voting!</h3>
              <p className="text-green-600">Your vote has been recorded successfully.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;