import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { validateComputerScienceStudentId, extractProgramType } from '../../utils/validation';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = ({ onToggle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
    console.log('Student ID validation:', validateComputerScienceStudentId(formData.studentId));
    
    // Validate Computer Science student ID
    if (!validateComputerScienceStudentId(formData.studentId)) {
      toast.error('Invalid student ID format. Only Computer Science students can register.\nFormat: FPI/HND/COM/YY/XXX or FPI/ND/YY/XXX');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    console.log('Starting registration process...');

    try {
      console.log('Creating user with email:', formData.email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('User created successfully:', userCredential.user.uid);

      const programType = extractProgramType(formData.studentId);
      console.log('Program type:', programType);

      const userData = {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId.toUpperCase(),
        program: programType,
        department: 'Computer Science',
        role: 'voter',
        hasVoted: false,
        createdAt: new Date()
      };
      console.log('Saving user data:', userData);

      // Save user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('User data saved to Firestore');

      toast.success('Registration successful! Please login to continue.');
      onToggle(); // Switch to login form
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please login instead.');
        onToggle(); // Switch to login form
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Computer Science Students Only</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-800">
            <strong>Eligible Programs:</strong><br/>
            • HND Computer Science (FPI/HND/COM/YY/XXX)<br/>
            • ND Computer Science (FPI/ND/COM/YY/XXX or FPI/ND/YY/XXX)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student ID (Computer Science Only)
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="FPI/HND/COM/24/001 or FPI/ND/COM/24/001"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format: FPI/HND/COM/YY/XXX or FPI/ND/COM/YY/XXX or FPI/ND/YY/XXX
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pl-10 pr-10"
              placeholder="Create a password"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-lg"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onToggle}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;