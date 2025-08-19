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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg">
                <Vote className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">E-Voting</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-600 truncate max-w-32">Welcome, {userInfo?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg">
                <Settings className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-white">{stats.totalPosts}</h3>
                <p className="text-xs sm:text-sm text-indigo-100">Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg">
                <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-white">{stats.totalCandidates}</h3>
                <p className="text-xs sm:text-sm text-green-100">Candidates</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg">
                <Vote className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-white">{stats.totalVoters}</h3>
                <p className="text-xs sm:text-sm text-purple-100">Voters</p>
              </div>
            </div>
          </div>

          <div className={`p-3 sm:p-6 rounded-xl shadow-lg ${stats.hasVoted ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'}`}>
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg">
                <Vote className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-white">
                  {stats.hasVoted ? 'Voted' : 'Pending'}
                </h3>
                <p className={`text-xs sm:text-sm ${stats.hasVoted ? 'text-green-100' : 'text-yellow-100'}`}>Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Status */}
        {votingSettings && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="text-center">
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Voting Period</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600 block mb-1">Starts:</span>
                  <div className="font-medium text-gray-900">{votingSettings.votingStart?.toDate().toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600 block mb-1">Ends:</span>
                  <div className="font-medium text-gray-900">{votingSettings.votingEnd?.toDate().toLocaleString()}</div>
                </div>
              </div>
              <div className={`mt-4 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium inline-block ${
                isVotingActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isVotingActive ? '🟢 Voting Active' : '🔴 Voting Inactive'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {!stats.hasVoted && isVotingActive && (
            <Link to="/vote" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-blue-100">
              <div className="text-center p-4 sm:py-8 sm:px-6">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Vote className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Cast Vote</h3>
                <p className="text-xs sm:text-sm text-gray-600">Participate in election</p>
              </div>
            </Link>
          )}
          
          {!stats.hasVoted && !isVotingActive && (
            <div className="bg-gray-100 rounded-xl shadow-lg cursor-not-allowed border border-gray-200">
              <div className="text-center p-4 sm:py-8 sm:px-6">
                <div className="bg-gray-200 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Vote className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-gray-500 mb-1 sm:mb-2">Voting Closed</h3>
                <p className="text-xs sm:text-sm text-gray-400">Not currently active</p>
              </div>
            </div>
          )}

          <Link to="/results" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-green-100">
            <div className="text-center p-4 sm:py-8 sm:px-6">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">View Results</h3>
              <p className="text-xs sm:text-sm text-gray-600">Live election results</p>
            </div>
          </Link>

          <Link to="/admin/election-report" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-blue-100">
            <div className="text-center p-4 sm:py-8 sm:px-6">
              <div className="bg-gradient-to-r from-blue-100 to-sky-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Election Report</h3>
              <p className="text-xs sm:text-sm text-gray-600">Detailed report</p>
            </div>
          </Link>

          {userRole === 'admin' && (
            <Link to="/admin" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-purple-100">
              <div className="text-center p-4 sm:py-8 sm:px-6">
                <div className="bg-gradient-to-r from-purple-100 to-violet-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Admin Panel</h3>
                <p className="text-xs sm:text-sm text-gray-600">Manage system</p>
              </div>
            </Link>
          )}

          {userRole === 'admin' && (
            <button onClick={handleResetVoting} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-red-100 hover:bg-red-50">
              <div className="text-center p-4 sm:py-8 sm:px-6">
                <div className="bg-gradient-to-r from-red-100 to-pink-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-red-900 mb-1 sm:mb-2">Reset Voting</h3>
                <p className="text-xs sm:text-sm text-red-600">Clear all data</p>
              </div>
            </button>
          )}
        </div>

        {stats.hasVoted && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <Vote className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">Thank you for voting! 🎉</h3>
              <p className="text-sm sm:text-base text-green-600">Your vote has been recorded successfully.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;