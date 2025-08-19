import { useState, useEffect } from 'react';
import { getPosts, getCandidates } from '../../services/firebaseService';
import { Trophy, Users } from 'lucide-react';

const LiveResults = () => {
  const [posts, setPosts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching live results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading results...</p>
      </div>
    );
  }

  // Group candidates by post and get top candidate for each
  const topCandidatesByPost = posts.map(post => {
    const postCandidates = candidates.filter(c => c.postId === post.id);
    const topCandidate = postCandidates.reduce((prev, current) => 
      (current.voteCount || 0) > (prev.voteCount || 0) ? current : prev
    , postCandidates[0]);
    
    return {
      post,
      topCandidate,
      totalVotes: postCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0),
      candidateCount: postCandidates.length
    };
  }).filter(item => item.topCandidate);

  const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

  if (topCandidatesByPost.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No results available yet</p>
        <p className="text-sm text-gray-500">Results will appear once voting begins</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalVotes}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Votes</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{posts.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Positions</div>
        </div>
        <div className="text-center col-span-2 sm:col-span-1">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{candidates.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Candidates</div>
        </div>
      </div>

      {/* Leading Candidates */}
      <div className="space-y-3">
        {topCandidatesByPost.map(({ post, topCandidate, totalVotes: postVotes, candidateCount }) => (
          <div key={post.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{post.title}</h3>
                </div>
                <p className="text-xs sm:text-sm font-medium text-blue-700 truncate">{topCandidate.name}</p>
                <p className="text-xs text-gray-600">{candidateCount} candidates competing</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg sm:text-xl font-bold text-blue-600">{topCandidate.voteCount || 0}</div>
                <div className="text-xs text-gray-500">
                  {postVotes > 0 ? `${((topCandidate.voteCount || 0) / postVotes * 100).toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: postVotes > 0 ? `${(topCandidate.voteCount || 0) / postVotes * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveResults;