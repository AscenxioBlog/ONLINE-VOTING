import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPosts, createCandidate } from '../services/firebaseService';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AddCandidate = () => {
  const [formData, setFormData] = useState({
    name: '',
    postId: '',
    description: ''
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchPosts();
  }, [userRole, navigate]);

  const fetchPosts = async () => {
    try {
      const postsData = await getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error loading posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.postId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await createCandidate({
        name: formData.name.trim(),
        postId: formData.postId,
        description: formData.description.trim()
      });

      toast.success('Candidate added successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Error adding candidate');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add New Candidate</h1>
          <div></div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter candidate's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post *
                </label>
                {loadingPosts ? (
                  <div className="input-field flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-500">Loading posts...</span>
                  </div>
                ) : (
                  <select
                    name="postId"
                    value={formData.postId}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select a post</option>
                    {posts.map(post => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                )}
                {posts.length === 0 && !loadingPosts && (
                  <p className="text-sm text-red-600 mt-1">
                    No posts available. Please add posts first.
                  </p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Brief description about the candidate..."
                />
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
                  <span>{loading ? 'Adding...' : 'Add Candidate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidate;