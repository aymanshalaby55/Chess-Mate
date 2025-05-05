/*!
 * Stockfish.js (http://github.com/nmrugg/stockfish.js)
 * License: GPL
 */

/*
 * Description of the universal chess interface (UCI)  https://gist.github.com/aliostad/f4470274f39d29b788c1b09519e67372/
 */

import createStockfishWorker from "@/lib/worker";

type EngineMessage = {
  /** stockfish engine message in UCI format*/
  uciMessage: string;
  /** found best move for current position in format `e2e4`*/
  bestMove?: string;
  /** found best move for opponent in format `e7e5` */
  ponder?: string;
  /**  material balance's difference in centipawns(IMPORTANT! stockfish gives the cp score in terms of whose turn it is)*/
  positionEvaluation?: string;
  /** count of moves until mate */
  possibleMate?: string;
  /** the best line found */
  pv?: string;
  /** number of halfmoves the engine looks ahead */
  depth?: number;
};

export default class Engine {
  stockfish: Worker | null;
  onMessage: (callback: (messageData: EngineMessage) => void) => void;
  isReady: boolean;
  private messageHandlers: Array<(data: EngineMessage) => void>;
  private waitingForBestMove: boolean;
  private bestMoveCallbacks: Array<(bestMove: string) => void> = [];

  constructor() {
    this.stockfish = createStockfishWorker();
    this.isReady = false;
    this.messageHandlers = [];
    this.waitingForBestMove = false;
    this.bestMoveCallbacks = [];
    
    if (this.stockfish) {
      this.stockfish.onmessage = (e: MessageEvent) => {
        const message = this.transformSFMessageData(e);
        console.log("Engine raw message:", message.uciMessage);
        
        // Check for readyok signal
        if (message.uciMessage.includes("readyok") && !this.isReady) {
          console.log("Engine is ready");
          this.isReady = true;
        }
        
        // Check for bestmove response when we're waiting for it
        if (message.bestMove) {
          console.log("Engine found best move:", message.bestMove);
          this.waitingForBestMove = false;

          // Trigger any registered best move callbacks
          this.bestMoveCallbacks.forEach(callback => {
            try {
              callback(message.bestMove as string);
            } catch (error) {
              console.error("Error in best move callback:", error);
            }
          });
        }
        
        // Dispatch message to all handlers
        this.messageHandlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error("Error in message handler:", error);
          }
        });
      };
      
      // Set up error handling
      this.stockfish.onerror = (e) => {
        console.error("Stockfish worker error:", e);
      };
    } else {
      console.error("Failed to initialize Stockfish worker");
    }

    this.onMessage = (callback) => {
      this.messageHandlers.push(callback);
    };
    
    this.init();
  }

  private transformSFMessageData(e: MessageEvent): EngineMessage {
    const uciMessage = typeof e.data === 'string' ? e.data : '';

    // Enhanced regex to better match best move messages
    const bestMoveMatch = uciMessage.match(/bestmove\s+(\w+)(?:\s+ponder\s+(\w+))?/);
    
    return {
      uciMessage,
      bestMove: bestMoveMatch ? bestMoveMatch[1] : undefined,
      ponder: bestMoveMatch ? bestMoveMatch[2] : undefined,
      positionEvaluation: uciMessage.match(/cp\s+(\S+)/)?.[1],
      possibleMate: uciMessage.match(/mate\s+(\S+)/)?.[1],
      pv: uciMessage.match(/ pv\s+(.*)/)?.[1],
      depth: Number(uciMessage.match(/ depth\s+(\S+)/)?.[1]) ?? 0,
    };
  }

  init() {
    if (!this.stockfish) {
      console.error('Stockfish worker not initialized');
      return;
    }
    
    console.log("Initializing engine...");
    this.stockfish.postMessage("uci");
    this.stockfish.postMessage("isready");
  }

  onReady(callback: () => void) {
    if (this.isReady) {
      callback();
      return;
    }
    
    const checkReadyHandler = ({ uciMessage }: EngineMessage) => {
      if (uciMessage.includes("readyok")) {
        callback();
        // Remove the handler after it's called
        const index = this.messageHandlers.indexOf(checkReadyHandler);
        if (index !== -1) {
          this.messageHandlers.splice(index, 1);
        }
      }
    };
    
    this.messageHandlers.push(checkReadyHandler);
  }

  onBestMove(callback: (bestMove: string) => void) {
    this.bestMoveCallbacks.push(callback);
    return () => {
      const index = this.bestMoveCallbacks.indexOf(callback);
      if (index !== -1) {
        this.bestMoveCallbacks.splice(index, 1);
      }
    };
  }

  evaluatePosition(fen: string, depth = 12) {
    if (!this.stockfish) {
      console.error('Stockfish worker not initialized');
      return;
    }
    
    if (depth > 24) depth = 24;
    
    console.log(`Evaluating position: ${fen} at depth ${depth}`);
    this.waitingForBestMove = true;
    
    // Reset any previous commands
    this.stockfish.postMessage("stop");
    // Set position from FEN
    this.stockfish.postMessage(`position fen ${fen}`);
    // Start search for best move
    this.stockfish.postMessage(`go depth ${depth}`);
  }

  stop() {
    if (this.stockfish) {
      this.stockfish.postMessage("stop"); 
    }
  }

  terminate() {
    if (this.stockfish) {
      this.isReady = false;
      try {
        this.stockfish.postMessage("quit");
        this.stockfish.terminate();
      } catch (error) {
        console.error("Error terminating engine:", error);
      }
      this.stockfish = null;
      this.messageHandlers = [];
      this.bestMoveCallbacks = [];
    }
  }
}