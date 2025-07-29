import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endTime) - new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return null;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">Voting has ended</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-blue-50 border-blue-200">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Time Remaining</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{timeLeft.days}</div>
            <div className="text-sm text-blue-500">Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
            <div className="text-sm text-blue-500">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
            <div className="text-sm text-blue-500">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds}</div>
            <div className="text-sm text-blue-500">Seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;