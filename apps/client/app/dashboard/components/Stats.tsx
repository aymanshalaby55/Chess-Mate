const Stats = () => {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Your Stats</h2>
        <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-900/30 rounded">
          Rating: 1920
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">42</div>
            <div className="text-xs text-zinc-400">Games Played</div>
          </div>
          <div className="bg-zinc-950 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">68%</div>
            <div className="text-xs text-zinc-400">Win Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-950 p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-green-400">24</div>
            <div className="text-xs text-zinc-400">Wins</div>
          </div>
          <div className="bg-zinc-950 p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-red-400">11</div>
            <div className="text-xs text-zinc-400">Losses</div>
          </div>
          <div className="bg-zinc-950 p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-zinc-400">7</div>
            <div className="text-xs text-zinc-400">Draws</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
