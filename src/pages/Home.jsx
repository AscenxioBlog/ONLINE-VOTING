import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import ForgotPassword from '../components/Auth/ForgotPassword';
import { Vote, Shield, BarChart3, X } from 'lucide-react';
import loggo from '../components/loggo.png'; // Assuming you have a logo image

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { currentUser, loading } = useAuth();

  // Make showForgotPassword available globally for Login component
  window.showForgotPassword = () => setShowForgotPassword(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen  computer">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className=" p-3 rounded-full h-[200px] w-[200px]">
              <img src={loggo} alt="Logo" />
              {/* <Vote className="w-8 h-8 text-white" /> */}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student E-Voting System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Secure, transparent, and efficient digital voting platform for student elections
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-8 py-3 text-lg"
          >
            Get Started
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-[#ffffff87] p-6 rounded-xl shadow-lg">
              <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Voting</h3>
              <p className="text-gray-600">
                Advanced security measures ensure your vote remains private and secure
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-[#ffffff87] p-6 rounded-xl shadow-lg">
              <Vote className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Simple and intuitive interface makes voting quick and effortless
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-[#ffffff87] p-6 rounded-xl shadow-lg">
              <BarChart3 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
              <p className="text-gray-600">
                View live election results with detailed analytics and charts
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              &copy; 2024 Student E-Voting System. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built for transparent and secure student elections
            </p>
          </div>
        </footer>

        {/* Auth Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              {showForgotPassword ? (
                <ForgotPassword onBack={() => {
                  setShowForgotPassword(false);
                  setIsLogin(true);
                }} />
              ) : isLogin ? (
                <Login onToggle={() => setIsLogin(false)} />
              ) : (
                <Register onToggle={() => setIsLogin(true)} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;