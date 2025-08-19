import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ArrowLeft, Save, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const VoterLimits = () => {
  const [limits, setLimits] = useState({
    hndLimit: 50,
    ndLimit: 50,
    enableLimits: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchLimits();
  }, [userRole, navigate]);

  const fetchLimits = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'voterLimits'));
      if (docSnap.exists()) {
        setLimits(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, 'settings', 'voterLimits'), {
        ...limits,
        updatedAt: new Date()
      });
      toast.success('Voter limits updated successfully!');
    } catch (error) {
      console.error('Error updating limits:', error);
      toast.error('Error updating voter limits');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Voter Registration Limits</h1>
          <div></div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Registration Limits by Level</h2>
              </div>
              <p className="text-gray-600">
                Set maximum number of voters allowed to register from each academic level.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableLimits"
                  checked={limits.enableLimits}
                  onChange={(e) => setLimits({ ...limits, enableLimits: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="enableLimits" className="text-sm font-medium text-gray-700">
                  Enable voter registration limits
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HND Computer Science Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={limits.hndLimit}
                    onChange={(e) => setLimits({ ...limits, hndLimit: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="e.g., 50"
                    disabled={!limits.enableLimits}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum HND students allowed to register
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ND Computer Science Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={limits.ndLimit}
                    onChange={(e) => setLimits({ ...limits, ndLimit: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="e.g., 50"
                    disabled={!limits.enableLimits}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum ND students allowed to register
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• When enabled, registration will be blocked once limits are reached</li>
                  <li>• Limits are based on student ID format (HND/COM vs ND/COM or ND)</li>
                  <li>• Existing registered users are not affected</li>
                  <li>• Disable limits to allow unlimited registration</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Limits'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterLimits;