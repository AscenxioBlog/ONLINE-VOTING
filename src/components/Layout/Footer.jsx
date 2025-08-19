import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
          Built with <Heart className="w-4 h-4 text-red-500" /> for transparent student elections
        </p>
        <p className="text-xs text-gray-500 mt-1">
          &copy; 2024 Student E-Voting System
        </p>
      </div>
    </footer>
  );
};

export default Footer;