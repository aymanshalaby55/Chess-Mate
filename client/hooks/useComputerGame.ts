// import { useState, useEffect, useDeferredValue, useRef } from 'react';
// import { Chess } from 'chess.js';

// export default function usePlayComputer() {
//   const [game, setGame] = useState(new Chess());
//   const [boardPosition, setBoardPosition] = useState('start');
//   const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
//   const [isEngineThinking, setIsEngineThinking] = useState(false);
//   const [moveView, setMoveView] = useState<'table' | 'list' | 'timeline'>('table');

//   const gamePositionsRef = useRef<string[]>([]);

//   const deferredBoardPosition = useDeferredValue(boardPosition);

//   useEffect(() => {
//     if (game.isGameOver()) {
//       console.log('Game Over');
//     }
//   }, [game]);

//   const onDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
//     const move = game.move({
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: 'q', // Always promote to queen
//     });

//     if (move === null) return false;

//     setBoardPosition(game.fen());
//     setIsEngineThinking(true);

//     setTimeout(() => {
//       const possibleMoves = game.moves({ verbose: true });
//       if (possibleMoves.length > 0) {
//         const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
//         game.move({
//           from: randomMove.from,
//           to: randomMove.to,
//           promotion: 'q',
//         });
//         setBoardPosition(game.fen());
//       }
//       setIsEngineThinking(false);
//     }, 1000);

//     return true;
//   };

//   return {
//     boardPosition,
//     deferredBoardPosition,
//     onDrop,
//     isEngineThinking,
//     engineReady: true, // assume always ready for simplicity
//     playerColor,
//     setPlayerColor,
//     moveView,
//     setMoveView,
//     viewingHistory: false,
//     setViewingHistory: () => {},
//     viewingMoveIndex: 0,
//     setViewingMoveIndex: () => {},
//     gamePositionsRef,
//     game,
//   };
// }
