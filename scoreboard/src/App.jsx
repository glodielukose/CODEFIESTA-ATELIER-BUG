import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('bug-hunt-teams');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTeamName, setNewTeamName] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem('bug-hunt-teams', JSON.stringify(teams));
  }, [teams]);

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.step !== a.step) return b.step - a.step;
    return a.name.localeCompare(b.name);
  });

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      alert("Temps écoulé !");
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const addTeam = () => {
    if (teams.length >= 10) {
      alert('Maximum 10 équipes atteint !');
      return;
    }
    if (!newTeamName.trim()) {
      alert('Nom requis !');
      return;
    }
    setTeams([...teams, { name: newTeamName, step: 1 }]);
    setNewTeamName('');
  };

  const nextStep = (teamName) => {
    setTeams(teams.map(team => 
      team.name === teamName ? { ...team, step: team.step + 1 } : team
    ));
  };

  const deleteTeam = (teamName) => {
    if (window.confirm(`Supprimer l'équipe "${teamName}" ?`)) {
      setTeams(teams.filter(team => team.name !== teamName));
    }
  };

  const resetGame = () => {
    if (window.confirm("Réinitialiser toute la partie ?")) {
      setTeams([]);
      setTimeLeft(60 * 60);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
          🏆 Chasse aux Bugs - Tableau des Scores
        </h1>
        
        {/* Timer Controls */}
        <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between mb-6 p-4 rounded-lg ${isRunning ? 'bg-blue-600 animate-pulse' : 'bg-gray-700'} text-white`}>
          <div className="font-mono text-xl sm:text-2xl font-bold">
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded font-medium w-full sm:w-auto ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} transition-colors`}
            >
              {isRunning ? 'Pause' : 'Démarrer'}
            </button>
            <button 
              onClick={resetGame} 
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded font-medium w-full sm:w-auto transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Add Team */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Nom de l'équipe"
            disabled={isRunning}
            className="flex-grow px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
          <button 
            onClick={addTeam} 
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors sm:w-auto w-full"
          >
            Ajouter
          </button>
        </div>

        {/* Scoreboard */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Équipe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bugs Résolus</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTeams.map((team, index) => (
                  <tr 
                    key={team.name} 
                    className={`${index === 0 ? 'bg-yellow-50 font-bold border-l-4 border-yellow-400 animate-pulse' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-3 whitespace-nowrap ${index === 0 ? 'text-yellow-600 text-lg' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-500'}`}>
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {team.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {team.step}/5
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                      <button 
                        onClick={() => nextStep(team.name)} 
                        disabled={!isRunning}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        +1 Bug
                      </button>
                      <button 
                        onClick={() => deleteTeam(team.name)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                        title="Supprimer l'équipe"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;