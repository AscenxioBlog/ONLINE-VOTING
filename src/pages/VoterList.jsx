import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ArrowLeft, Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const VoterList = () => {
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVoters();
  }, []);

  useEffect(() => {
    const filtered = voters.filter(voter =>
      voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVoters(filtered);
  }, [voters, searchTerm]);

  const fetchVoters = async () => {
    try {
      const votersSnapshot = await getDocs(collection(db, 'users'));
      const votersData = votersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.role === 'voter')
        .sort((a, b) => a.name.localeCompare(b.name));

      setVoters(votersData);
    } catch (error) {
      console.error('Error fetching voters:', error);
      toast.error('Error loading voters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voters...</p>
        </div>
      </div>
    );
  }

  const votedCount = voters.filter(voter => voter.hasVoted).length;
  const pendingCount = voters.length - votedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Voter Management</h1>
          <div></div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{voters.length}</div>
              <div className="text-gray-600">Total Voters</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{votedCount}</div>
              <div className="text-gray-600">Voted</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by name, email, or student ID..."
            />
          </div>
        </div>

        {/* Voters Table */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Registered Voters</h2>
            <p className="text-gray-600">
              Showing {filteredVoters.length} of {voters.length} voters
            </p>
          </div>

          {filteredVoters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Student ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Password</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Voted At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.map(voter => (
                    <tr key={voter.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{voter.name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{voter.studentId}</td>
                      <td className="py-3 px-4 text-gray-600">{voter.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {voter.plainPassword || 'Not Available'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {voter.hasVoted ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-green-600 font-medium">Voted</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-yellow-500" />
                              <span className="text-yellow-600 font-medium">Pending</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {voter.votedAt?.toDate?.()?.toLocaleString() || 'Not voted yet'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchTerm ? 'No voters found matching your search.' : 'No voters registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoterList;