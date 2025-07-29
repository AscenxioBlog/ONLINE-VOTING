import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPosts, getCandidatesByPost, submitVote, hasUserVoted, getVotingSettings } from '../services/firebaseService';
import VoteCard from '../components/Voting/VoteCard';
import { ArrowLeft, ArrowRight, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const VotingPage = () => {
  const [posts, setPosts] = useState([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingSettings, setVotingSettings] = useState(null);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      initializeVoting();
    }
  }, [currentUser]);

  useEffect(() => {
    if (posts.length > 0 && currentPostIndex < posts.length) {
      fetchCandidatesForCurrentPost();
    }
  }, [posts, currentPostIndex]);

  const initializeVoting = async () => {
    try {
      const [postsData, votedStatus, settings] = await Promise.all([
        getPosts(),
        hasUserVoted(currentUser.uid),
        getVotingSettings()
      ]);

      setPosts(postsData);
      setHasVoted(votedStatus);
      setVotingSettings(settings);
      
      // Check if voting is currently active
      if (settings) {
        const now = new Date();
        const start = settings.votingStart?.toDate();
        const end = settings.votingEnd?.toDate();
        setIsVotingActive(now >= start && now <= end);
      }
    } catch (error) {
      console.error('Error initializing voting:', error);
      toast.error('Error loading voting data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidatesForCurrentPost = async () => {
    if (posts[currentPostIndex]) {
      try {
        const candidatesData = await getCandidatesByPost(posts[currentPostIndex].id);
        setCandidates(candidatesData);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        toast.error('Error loading candidates');
      }
    }
  };

  const handleVoteSelect = (candidateId) => {
    const currentPost = posts[currentPostIndex];
    if (currentPost) {
      setSelectedVotes(prev => ({
        ...prev,
        [currentPost.id]: candidateId
      }));
    }
  };

  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(prev => prev + 1);
    }
  };

  const handlePreviousPost = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(prev => prev - 1);
    }
  };

  const handleSubmitVotes = async () => {
    if (Object.keys(selectedVotes).length !== posts.length) {
      toast.error('Please vote for all posts before submitting');
      return;
    }

    setSubmitting(true);

    try {
      await submitVote(currentUser.uid, selectedVotes);
      toast.success('Vote submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Error submitting vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Already Voted</h2>
          <p className="text-gray-600 mb-6">You have already cast your vote in this election.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isVotingActive && votingSettings) {
    const now = new Date();
    const start = votingSettings.votingStart?.toDate();
    const end = votingSettings.votingEnd?.toDate();
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {now < start ? 'Voting Not Started' : 'Voting Ended'}
          </h2>
          <p className="text-gray-600 mb-6">
            {now < start 
              ? `Voting starts on ${start.toLocaleString()}`
              : `Voting ended on ${end.toLocaleString()}`
            }
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Posts Available</h2>
          <p className="text-gray-600 mb-6">There are no election posts available for voting.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentPostIndex];
  const isLastPost = currentPostIndex === posts.length - 1;
  const currentSelection = selectedVotes[currentPost?.id];

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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Cast Your Vote</h1>
            <p className="text-gray-600 mt-2">
              Step {currentPostIndex + 1} of {posts.length}
            </p>
          </div>
          <div></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPostIndex + 1) / posts.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Post Voting */}
        {currentPost && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentPost.title}</h2>
            <p className="text-gray-600 mb-6">Select one candidate for this position:</p>
            
            <div className="space-y-4">
              {candidates.map(candidate => (
                <VoteCard
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={currentSelection === candidate.id}
                  onSelect={handleVoteSelect}
                  disabled={submitting}
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousPost}
            disabled={currentPostIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
              currentPostIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Voted for {Object.keys(selectedVotes).length} of {posts.length} posts
            </p>
          </div>

          {isLastPost ? (
            <button
              onClick={handleSubmitVotes}
              disabled={!currentSelection || submitting || Object.keys(selectedVotes).length !== posts.length}
              className="btn-primary flex items-center space-x-2 px-6 py-3"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Vote'}</span>
            </button>
          ) : (
            <button
              onClick={handleNextPost}
              disabled={!currentSelection}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
                !currentSelection
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPage;