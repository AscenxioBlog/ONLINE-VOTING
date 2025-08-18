import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ArrowLeft, Users, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const DetailedResults = () => {
  const [posts, setPosts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetailedData();
  }, []);

  const fetchDetailedData = async () => {
    try {
      const [postsSnapshot, candidatesSnapshot, votesSnapshot, votersSnapshot] = await Promise.all([
        getDocs(collection(db, 'posts')),
        getDocs(collection(db, 'candidates')),
        getDocs(collection(db, 'votes')),
        getDocs(collection(db, 'users'))
      ]);

      const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const candidatesData = candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const votesData = votesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const votersData = votersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));



      setPosts(postsData);
      setCandidates(candidatesData);
      setVotes(votesData);
      setVoters(votersData);
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      toast.error('Error loading detailed results');
    } finally {
      setLoading(false);
    }
  };

  const getVotersForCandidate = (candidateId, postTitle) => {
    const candidateVoters = [];
    
    votes.forEach(voteDoc => {
      // Try different ways to access the vote data
      const voteData = voteDoc.data ? voteDoc.data() : voteDoc;
      
      // Check all possible keys in the vote document
      Object.keys(voteData).forEach(key => {
        if (key !== 'id' && voteData[key] === candidateId) {
          const voter = voters.find(v => v.id === voteDoc.id);
          if (voter && !candidateVoters.find(cv => cv.id === voter.id)) {
            candidateVoters.push(voter);
          }
        }
      });
    });
    
    return candidateVoters;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading detailed results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Admin</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Detailed Results</h1>
          <div className="w-8 sm:w-0"></div>
        </div>

        <div className="space-y-6">
          {posts.map(post => {
            const postCandidates = candidates.filter(c => c.postId === post.id);
            
            return (
              <div key={post.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{post.title}</h2>
                
                <div className="space-y-4">
                  {postCandidates.map(candidate => {
                    const candidateVoters = getVotersForCandidate(candidate.id, post.title);
                    const isExpanded = expandedCandidate === candidate.id;
                    
                    return (
                      <div key={candidate.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {candidate.name}
                            </h3>
                            <p className="text-sm text-gray-600">{candidate.description}</p>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <div className="text-center">
                              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                                {candidateVoters.length}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">votes</div>
                            </div>
                            <button
                              onClick={() => setExpandedCandidate(isExpanded ? null : candidate.id)}
                              className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm"
                            >
                              {isExpanded ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                              <span className="hidden sm:block">{isExpanded ? 'Hide' : 'Show'} Voters</span>
                            </button>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Voters ({candidateVoters.length})
                            </h4>
                            
                            {candidateVoters.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {candidateVoters.map(voter => (
                                  <div key={voter.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="font-medium text-gray-900 text-sm">{voter.name}</div>
                                    <div className="text-xs text-gray-600">{voter.studentId}</div>
                                    <div className="text-xs text-gray-500">{voter.email}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Voted: {voter.votedAt?.toDate?.()?.toLocaleString() || 'Unknown time'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                No votes yet for this candidate
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {postCandidates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No candidates added for this post yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No election posts found.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedResults;