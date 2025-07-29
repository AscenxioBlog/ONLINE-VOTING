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
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="card mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Election Summary</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <div className="text-3xl font-bold text-primary-600">{totalVotes}</div>
                <div className="text-gray-600">Total Votes Cast</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{candidates.length}</div>
                <div className="text-gray-600">Total Candidates</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{posts.length}</div>
                <div className="text-gray-600">Posts</div>
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
          <div className="card text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600">No candidates or votes have been recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;