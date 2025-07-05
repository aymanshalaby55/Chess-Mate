// lib/worker.ts
export default function createStockfishWorker() {
  // Only create the worker on the client side
  if (typeof window !== 'undefined') {
    try {
      // Use a more robust way to create the worker
      // console.log("Creating Stockfish worker...");

      // Try to create the worker
      const worker = new window.Worker('/stockfish/stockfish.wasm.js');

      // Log success and initialize basic handlers
      // console.log("Stockfish worker created successfully");

      // Add event listener for errors
      worker.addEventListener('error', (err) => {
        console.error('Stockfish worker error:', err);
      });

      // Test that the worker is functioning
      worker.postMessage('isready');

      return worker;
    } catch (error) {
      console.error('Failed to create Stockfish worker:', error);

      // Try regular JS version as fallback
      try {
        // console.log(
        //     "Attempting to use stockfish.js instead of WASM version",
        // );
        const worker = new window.Worker('/stockfish/stockfish.js');
        worker.postMessage('isready');
        return worker;
      } catch (fallbackError) {
        console.error(
          'All attempts to create Stockfish worker failed:',
          fallbackError
        );
        return null;
      }
    }
  }
  return null;
}
