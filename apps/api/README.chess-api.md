# Chess Game API Documentation

This document outlines the API endpoints for the Chess-Mate backend, specifically focused on the game service for playing against a computer opponent.

## Authentication

All endpoints require JWT authentication. Include the JWT token as a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Alternatively, the token can be included in the `accesstoken` cookie.

## Endpoints

### Create a new game against computer

**Endpoint:** `POST /games/computer`

**Request Body:**
```json
{
  "side": "white" // or "black"
}
```

**Response:**
```json
{
  "id": 1,
  "player1_id": 123,
  "player2_id": 123,
  "computerSide": "black",
  "isComputer": true,
  "winnerId": null,
  "status": "ongoing",
  "boardStatus": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "createdAt": "2023-05-15T12:34:56.789Z",
  "lastMoveAt": "2023-05-15T12:34:56.789Z"
}
```

### List user's games

**Endpoint:** `GET /games?limit=10&offset=0`

**Query Parameters:**
- `limit` (optional): Number of games to retrieve (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "games": [
    {
      "id": 1,
      "player1_id": 123,
      "player2_id": 123,
      "computerSide": "black",
      "isComputer": true,
      "winnerId": null,
      "status": "ongoing",
      "boardStatus": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "createdAt": "2023-05-15T12:34:56.789Z",
      "lastMoveAt": "2023-05-15T12:34:56.789Z",
      "player1": {
        "id": 123,
        "name": "Player Name",
        "picture": "https://example.com/avatar.jpg"
      },
      "player2": {
        "id": 123,
        "name": "Player Name",
        "picture": "https://example.com/avatar.jpg"
      },
      "_count": {
        "moves": 0
      }
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Get a specific game

**Endpoint:** `GET /games/:id`

**Response:**
```json
{
  "id": 1,
  "player1_id": 123,
  "player2_id": 123,
  "computerSide": "black",
  "isComputer": true,
  "winnerId": null,
  "status": "ongoing",
  "boardStatus": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "createdAt": "2023-05-15T12:34:56.789Z",
  "lastMoveAt": "2023-05-15T12:34:56.789Z",
  "player1": {
    "id": 123,
    "name": "Player Name",
    "email": "user@example.com",
    "picture": "https://example.com/avatar.jpg"
  },
  "player2": {
    "id": 123,
    "name": "Player Name",
    "email": "user@example.com",
    "picture": "https://example.com/avatar.jpg"
  },
  "moves": [
    {
      "id": 1,
      "gameId": 1,
      "moveNumber": 0,
      "from": "e2",
      "to": "e4",
      "piece": "p",
      "promotion": null,
      "capture": false,
      "check": false,
      "checkmate": false,
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "pgn": "1. e4",
      "createdAt": "2023-05-15T12:35:00.000Z"
    }
  ]
}
```

### Make a move

**Endpoint:** `POST /games/:id/move`

**Request Body:**
```json
{
  "from": "e2",
  "to": "e4",
  "promotion": "q" // optional, used for pawn promotion
}
```

**Response:**
```json
{
  "move": {
    "id": 1,
    "gameId": 1,
    "moveNumber": 0,
    "from": "e2",
    "to": "e4",
    "piece": "p",
    "promotion": null,
    "capture": false,
    "check": false,
    "checkmate": false,
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "pgn": "1. e4",
    "createdAt": "2023-05-15T12:35:00.000Z"
  },
  "game": {
    "id": 1,
    "player1_id": 123,
    "player2_id": 123,
    "computerSide": "black",
    "isComputer": true,
    "winnerId": null,
    "status": "ongoing",
    "boardStatus": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "createdAt": "2023-05-15T12:34:56.789Z",
    "lastMoveAt": "2023-05-15T12:35:00.000Z"
  }
}
```

For games against the computer, the response will include both your move and the computer's move.

### Resign a game

**Endpoint:** `POST /games/:id/resign`

**Response:**
```json
{
  "id": 1,
  "player1_id": 123,
  "player2_id": 123,
  "computerSide": "black",
  "isComputer": true,
  "winnerId": null,
  "status": "resigned",
  "boardStatus": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "createdAt": "2023-05-15T12:34:56.789Z",
  "lastMoveAt": "2023-05-15T12:35:00.000Z"
}
```

## Game Status Values

The game status can be one of the following:
- `ongoing`: Game is in progress
- `white_won`: White player won
- `black_won`: Black player won
- `draw`: Game ended in a draw
- `resigned`: One player resigned

## Error Handling

All errors return an appropriate HTTP status code along with a JSON response containing an error message:

```json
{
  "statusCode": 400,
  "message": "Invalid move",
  "error": "Bad Request"
}
```

Common error codes:
- `400 Bad Request`: Invalid move or other client error
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Game not found
- `500 Internal Server Error`: Server-side error 