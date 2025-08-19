import { useState, useEffect } from 'react';
import { getCandidates, getPosts } from '../../services/firebaseService';
import { Trophy, Users, Download, Printer } from 'lucide-react';

const ElectionReport = () => {
  const [candidates, setCandidates] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesData, postsData] = await Promise.all([
        getCandidates(),
        getPosts()
      ]);
      setCandidates(candidatesData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultsByPost = () => {
    return posts.map(post => {
      const postCandidates = candidates
        .filter(candidate => candidate.postId === post.id)
        .sort((a, b) => b.voteCount - a.voteCount);
      
      return {
        ...post,
        candidates: postCandidates,
        winner: postCandidates[0] || null,
        totalVotes: postCandidates.reduce((sum, c) => sum + c.voteCount, 0)
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const results = getResultsByPost();
    let reportContent = 'ELECTION RESULTS REPORT\n';
    reportContent += '========================\n\n';
    
    results.forEach(post => {
      reportContent += `${post.title.toUpperCase()}\n`;
      reportContent += '-'.repeat(post.title.length) + '\n';
      reportContent += `Total Votes: ${post.totalVotes}\n`;
      reportContent += `Winner: ${post.winner?.name || 'No votes'}\n\n`;
      
      reportContent += 'All Candidates:\n';
      post.candidates.forEach((candidate, index) => {
        reportContent += `${index + 1}. ${candidate.name} - ${candidate.voteCount} votes\n`;
      });
      reportContent += '\n';
    });

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'election-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const results = getResultsByPost();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Election Results Report</h2>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {results.map(post => (
        <div key={post.id} className="card">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{post.totalVotes} Total Votes</span>
              </div>
              {post.winner && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Trophy className="w-4 h-4" />
                  <span>Winner: {post.winner.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {post.candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                    {candidate.description && (
                      <p className="text-sm text-gray-600">{candidate.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {candidate.voteCount} votes
                  </div>
                  <div className="text-sm text-gray-600">
                    {post.totalVotes > 0 
                      ? `${((candidate.voteCount / post.totalVotes) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>

          {post.candidates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No candidates for this position
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ElectionReport;