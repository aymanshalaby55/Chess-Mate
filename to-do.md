steps
- auth 
- game
- realtime

# frontend
## 1.auth
- landing page with chess theme
- login form with email/password
- Google OAuth signup button
- color scheme: black, white, green accents
- responsive design for mobile/desktop

## 2.game
- interactive chess board using chess.js
- drag-and-drop piece movement
- move validation and highlighting
- game state indicators (check, checkmate, stalemate)
- move history panel
- timer/clock functionality
- chat box for players
- spectator mode

## 3.realtime
- WebSocket connection for live updates
- move synchronization between players
- real-time chat updates
- game state persistence

# backend
## 1.auth
- MongoDB database for user profiles
- JWT authentication
- Google OAuth integration
- password hashing with bcrypt
- session management

## 2.game
- game state storage
- move validation logic
- game history recording
- rating system implementation
- matchmaking system

## 3.realtime
- WebSocket server implementation
- real-time game state updates
- message queue for chat
- connection management
- game state recovery on disconnect
