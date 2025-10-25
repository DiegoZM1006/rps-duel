function ScoreBoard({ score, maxScore, isPlayer = false }) {
  return (
    <div className="bg-game-bg p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-sm">Puntos</span>
        <span className={`text-2xl font-bold ${isPlayer ? 'text-green-400' : 'text-blue-400'}`}>
          {score} / {maxScore}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isPlayer ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${(score / maxScore) * 100}%` }}
        ></div>
      </div>
      
      {/* Score Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {[...Array(maxScore)].map((_, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full ${
              idx < score
                ? isPlayer ? 'bg-green-500' : 'bg-blue-500'
                : 'bg-gray-600'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default ScoreBoard;