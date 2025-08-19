import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResultChart = ({ candidates, position }) => {
  const data = {
    labels: candidates.map(candidate => candidate.name),
    datasets: [
      {
        label: 'Votes',
        data: candidates.map(candidate => candidate.voteCount || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${position} Results`,
        font: {
          size: 18,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const totalVotes = candidates.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{position}</h3>
        <p className="text-sm sm:text-base text-gray-600">Total Votes: {totalVotes}</p>
      </div>
      
      <div className="mb-4 sm:mb-6 h-64 sm:h-80">
        <Bar data={data} options={options} />
      </div>

      <div className="space-y-2 sm:space-y-3">
        {candidates
          .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
          .map((candidate, index) => {
            const percentage = totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes * 100).toFixed(1) : 0;
            return (
              <div key={candidate.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-400' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                  }`}></div>
                  <span className="font-medium text-sm sm:text-base truncate">{candidate.name}</span>
                </div>
                <div className="text-right ml-2">
                  <div className="font-semibold text-sm sm:text-base">{candidate.voteCount || 0} votes</div>
                  <div className="text-xs sm:text-sm text-gray-500">{percentage}%</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ResultChart;