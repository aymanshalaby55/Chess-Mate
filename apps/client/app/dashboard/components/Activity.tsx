const Activity = () => {
    return (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                            B
                        </div>
                        <div>
                            <div className="font-medium">vs. BlackMaster</div>
                            <div className="text-xs text-zinc-400">
                                Won • 32 moves • 15 min ago
                            </div>
                        </div>
                    </div>
                    <div className="text-green-400 font-bold">+15</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-black font-bold">
                            W
                        </div>
                        <div>
                            <div className="font-medium">vs. ChessWizard</div>
                            <div className="text-xs text-zinc-400">
                                Lost • 28 moves • 2 hours ago
                            </div>
                        </div>
                    </div>
                    <div className="text-red-400 font-bold">-12</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                            B
                        </div>
                        <div>
                            <div className="font-medium">vs. GrandMaster42</div>
                            <div className="text-xs text-zinc-400">
                                Draw • 45 moves • Yesterday
                            </div>
                        </div>
                    </div>
                    <div className="text-zinc-400 font-bold">+2</div>
                </div>
            </div>
        </div>
    );
};

export default Activity;
