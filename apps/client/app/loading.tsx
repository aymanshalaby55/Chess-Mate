import { Loader2 } from 'lucide-react';

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    </div>
  );
};

export default LoadingPage;
