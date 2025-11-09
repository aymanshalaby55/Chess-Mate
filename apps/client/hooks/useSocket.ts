// Add this to your React component

import { io } from "socket.io-client";

// Initialize socket connection
const socket = io("http://localhost:3001"); // Your NestJS server URL

// Add these functions to your component

const testSocketConnection = () => {
  // Test basic message
  socket.emit("test-message", {
    playerId: inputPlayerId,
    message: "Hello from client!",
    gameId: gameId,
  });
};

const sendChessMove = (moveData) => {
  // Send chess move
  socket.emit("chess-move", {
    gameId: gameId,
    playerId: inputPlayerId,
    move: moveData.move,
    fen: moveData.fen,
  });
};

const joinGameRoom = () => {
  // Join a room for the game
  socket.emit("join-room", gameId);
};

// Add these event listeners (put in useEffect)
useEffect(() => {
  // Listen for test responses
  socket.on("test-response", (data) => {
    console.log("Test response:", data);
  });

  // Listen for move updates
  socket.on("move-update", (data) => {
    console.log("Move update received:", data);
    // Update your game state here
  });

  // Listen for room join confirmations
  socket.on("joined-room", (data) => {
    console.log("Joined room:", data);
  });

  // Listen for other players joining
  socket.on("player-joined", (data) => {
    console.log("Player joined:", data);
  });

  // Cleanup
  return () => {
    socket.off("test-response");
    socket.off("move-update");
    socket.off("joined-room");
    socket.off("player-joined");
  };
}, []);
