import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { validateComputerScienceStudentId } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = ({ onToggle }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let email = loginId.trim();
      
      // Check if input is an email or student ID
      const isEmail = email.includes('@');
      
      if (isEmail) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          toast.error('Please enter a valid email address (e.g., user@example.com)');
          setLoading(false);
          return;
        }
      } else {
        // Handle student ID
        const cleanId = email.replace(/\s+/g, '').toUpperCase();
        
        // Validate if it's a valid CS student ID
        if (!validateComputerScienceStudentId(cleanId)) {
          toast.error('Invalid student ID format or not a Computer Science student');
          setLoading(false);
          return;
        }
        
        // Find user by student ID
        const q = query(collection(db, 'users'), where('studentId', '==', cleanId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          toast.error('Student ID not found. Please register first.');
          setLoading(false);
          return;
        }
        
        email = querySnapshot.docs[0].data().email;
      }
      
      // Attempt Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('Account not found. Please register first.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email format. Please check your email address.');
          break;
        case 'auth/user-disabled':
          toast.error('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed attempts. Please try again later.');
          break;
        default:
          toast.error('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Computer Science Students Only</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-green-800">
            Login with your Student ID or Email
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student ID or Email
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="input-field pl-10"
              placeholder="FPI/ND/COM/24/010 or user@example.com"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter your student ID or email address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-lg"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-gray-600">
          <button
            onClick={() => window.showForgotPassword && window.showForgotPassword()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot your password?
          </button>
        </p>
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onToggle}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;