import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts, getCandidates } from '../services/firebaseService';
import ResultChart from '../components/Results/ResultChart';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ResultPage = () => {
  const [posts, setPosts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const [postsData, candidatesData] = await Promise.all([
        getPosts(),
        getCandidates()
      ]);
      setPosts(postsData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Error loading results');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
    toast.success('Results updated');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Group candidates by post
  const candidatesByPost = posts.map(post => ({
    post,
    candidates: candidates.filter(candidate => candidate.postId === post.id)
  })).filter(group => group.candidates.length > 0);

  const totalVotes = candidates.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:block">Back</span>
          </button>
          <h1 className="text-lg sm:text-3xl font-bold text-gray-900">Results</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all text-xs sm:text-sm"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="text-center">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Election Summary</h2>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div>
                <div className="text-xl sm:text-3xl font-bold text-blue-600">{totalVotes}</div>
                <div className="text-xs sm:text-base text-gray-600">Votes Cast</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-bold text-green-600">{candidates.length}</div>
                <div className="text-xs sm:text-base text-gray-600">Candidates</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-bold text-purple-600">{posts.length}</div>
                <div className="text-xs sm:text-base text-gray-600">Positions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Results by Post */}
        <div className="space-y-8">
          {candidatesByPost.map(({ post, candidates: postCandidates }) => (
            <ResultChart
              key={post.id}
              candidates={postCandidates}
              position={post.title}
            />
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Results Available</h3>
            <p className="text-sm sm:text-base text-gray-600">No candidates or votes have been recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;