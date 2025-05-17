"use client";

import { useEffect, useRef } from "react";

// Unicode symbols for chess pieces
const pieceSymbols = {
    pawn_w: "♙",
    knight_w: "♘",
    bishop_w: "♗",
    rook_w: "♖",
    queen_w: "♕",
    king_w: "♔",
    pawn_b: "♟",
    knight_b: "♞",
    bishop_b: "♝",
    rook_b: "♜",
    queen_b: "♛",
    king_b: "♚",
} as const;

// Initial board setup
const initialBoard = [
    [
        "rook_b",
        "knight_b",
        "bishop_b",
        "queen_b",
        "king_b",
        "bishop_b",
        "knight_b",
        "rook_b",
    ],
    [
        "pawn_b",
        "pawn_b",
        "pawn_b",
        "pawn_b",
        "pawn_b",
        "pawn_b",
        "pawn_b",
        "pawn_b",
    ],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [
        "pawn_w",
        "pawn_w",
        "pawn_w",
        "pawn_w",
        "pawn_w",
        "pawn_w",
        "pawn_w",
        "pawn_w",
    ],
    [
        "rook_w",
        "knight_w",
        "bishop_w",
        "queen_w",
        "king_w",
        "bishop_w",
        "knight_w",
        "rook_w",
    ],
] as const;

type PieceType = keyof typeof pieceSymbols | null;

export default function RealisticChessboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas dimensions
        const setDimensions = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = Math.min(container.clientWidth, 400);
                canvas.height = Math.min(container.clientWidth, 400);
            }
        };

        setDimensions();
        window.addEventListener("resize", setDimensions);

        // Draw chessboard
        const drawChessboard = () => {
            if (!ctx || !canvas) return;

            const { width, height } = canvas;
            const squareSize = width / 8;

            // Draw board
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const isLightSquare = (row + col) % 2 === 0;
                    ctx.fillStyle = isLightSquare ? "#f0e9c5" : "#8aad6a";
                    ctx.fillRect(
                        col * squareSize,
                        row * squareSize,
                        squareSize,
                        squareSize,
                    );

                    // Coordinates
                    ctx.fillStyle = isLightSquare ? "#8aad6a" : "#f0e9c5";
                    ctx.font = `${squareSize * 0.2}px Arial`;
                    ctx.textAlign = "right";
                    ctx.textBaseline = "bottom";
                    if (row === 7) {
                        ctx.fillText(
                            String.fromCharCode(97 + col),
                            (col + 1) * squareSize - 3,
                            (row + 1) * squareSize - 3,
                        );
                    }
                    if (col === 0) {
                        ctx.textAlign = "left";
                        ctx.textBaseline = "top";
                        ctx.fillText(
                            String(8 - row),
                            col * squareSize + 3,
                            row * squareSize + 3,
                        );
                    }
                }
            }

            // Draw pieces
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = initialBoard[row][col];
                    if (piece) {
                        drawPiece(piece, col, row, squareSize);
                    }
                }
            }

            // Border
            ctx.strokeStyle = "#5a7344";
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, width, height);
        };

        // Draw a chess piece using Unicode
        const drawPiece = (
            piece: PieceType,
            col: number,
            row: number,
            squareSize: number,
        ) => {
            if (!ctx || !piece) return;
            const symbol = pieceSymbols[piece];
            const centerX = col * squareSize + squareSize / 2;
            const centerY =
                row * squareSize + squareSize / 2 + squareSize * 0.1;
            ctx.font = `${squareSize * 0.7}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = piece.includes("_w") ? "#ffffff" : "#000000";
            ctx.fillText(symbol, centerX, centerY);
        };

        // Animation loop
        let animationFrame: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawChessboard();
            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", setDimensions);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <div className="w-full max-w-[500px] mx-auto bg-zinc-800 rounded-lg p-1 shadow-lg overflow-hidden">
            <div className="w-full aspect-square p-1 bg-[#5a7344] rounded">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
        </div>
    );
}
