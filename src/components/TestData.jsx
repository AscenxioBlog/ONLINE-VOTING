import { useState } from 'react';
import { createPost, createCandidate } from '../services/firebaseService';
import toast from 'react-hot-toast';

const TestData = () => {
  const [loading, setLoading] = useState(false);

  const addSampleData = async () => {
    setLoading(true);
    try {
      // Add sample posts
      const post1Id = await createPost({ title: 'President', order: 1 });
      const post2Id = await createPost({ title: 'Secretary', order: 2 });
      
      // Add sample candidates
      await createCandidate({
        name: 'John Doe',
        postId: post1Id,
        description: 'Experienced leader'
      });
      
      await createCandidate({
        name: 'Jane Smith',
        postId: post1Id,
        description: 'Fresh perspective'
      });
      
      await createCandidate({
        name: 'Bob Johnson',
        postId: post2Id,
        description: 'Organized and efficient'
      });
      
      toast.success('Sample data added successfully!');
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast.error('Error adding sample data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Test Data</h3>
      <p className="text-yellow-700 mb-4">Add sample posts and candidates for testing</p>
      <button
        onClick={addSampleData}
        disabled={loading}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Sample Data'}
      </button>
    </div>
  );
};

export default TestData;