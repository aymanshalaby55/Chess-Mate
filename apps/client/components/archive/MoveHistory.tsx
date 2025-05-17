import { Chess } from "chess.js";
import React from "react";

type MoveHistoryProps = {
    game: Chess;
    onMoveClick?: (moveIndex: number) => void;
    currentMoveIndex?: number;
};

const MoveHistory: React.FC<MoveHistoryProps> = ({
    game,
    onMoveClick,
    currentMoveIndex = -1,
}) => {
    // Get history from chess.js
    const history = game.history({ verbose: true });

    // Group moves by number (pair white and black moves)
    const groupedMoves: Array<{
        white: string;
        black: string | null;
        whiteSan: string;
        blackSan: string | null;
    }> = [];

    // Get simple history (just SAN notation)
    const sanHistory = game.history();

    for (let i = 0; i < history.length; i += 2) {
        const whiteMove = history[i];
        const blackMove = history[i + 1] || null;

        groupedMoves.push({
            white: `${whiteMove.from}-${whiteMove.to}${whiteMove.promotion ? `=${whiteMove.promotion.toUpperCase()}` : ""}`,
            black: blackMove
                ? `${blackMove.from}-${blackMove.to}${blackMove.promotion ? `=${blackMove.promotion.toUpperCase()}` : ""}`
                : null,
            whiteSan: sanHistory[i],
            blackSan: blackMove ? sanHistory[i + 1] : null,
        });
    }

    return (
        <div className="border rounded-md p-4 bg-white shadow-sm h-full overflow-auto">
            <h3 className="text-lg font-semibold mb-4 text-center border-b pb-2">
                Move History
            </h3>

            {groupedMoves.length === 0 ? (
                <div className="text-gray-500 text-center pt-4 pb-4">
                    No moves yet
                </div>
            ) : (
                <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-2 px-2 text-left font-medium text-gray-700 w-10">
                                    #
                                </th>
                                <th className="py-2 px-2 text-left font-medium text-gray-700">
                                    White
                                </th>
                                <th className="py-2 px-2 text-left font-medium text-gray-700">
                                    Black
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedMoves.map((move, index) => (
                                <tr
                                    key={index}
                                    className={
                                        index % 2 === 1 ? "bg-gray-50" : ""
                                    }
                                >
                                    <td className="py-2 px-2 text-gray-600">
                                        {index + 1}.
                                    </td>
                                    <td
                                        className={`py-2 px-2 font-mono hover:bg-blue-100 cursor-pointer rounded transition-colors duration-150 ${
                                            currentMoveIndex === index * 2
                                                ? "bg-blue-200 font-bold"
                                                : ""
                                        }`}
                                        onClick={() => onMoveClick?.(index * 2)}
                                        title={move.white}
                                    >
                                        {move.whiteSan}
                                    </td>
                                    <td
                                        className={`py-2 px-2 font-mono ${
                                            move.black
                                                ? "hover:bg-blue-100 cursor-pointer"
                                                : "text-gray-400"
                                        } rounded transition-colors duration-150 ${
                                            currentMoveIndex === index * 2 + 1
                                                ? "bg-blue-200 font-bold"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            move.black &&
                                            onMoveClick?.(index * 2 + 1)
                                        }
                                        title={move.black || ""}
                                    >
                                        {move.blackSan || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Current game status */}
            <div className="mt-4 pt-3 border-t text-sm">
                {game.isCheckmate() ? (
                    <div className="text-red-600 font-semibold text-center">
                        Checkmate
                    </div>
                ) : game.isDraw() ? (
                    <div className="text-blue-600 font-semibold text-center">
                        Draw
                    </div>
                ) : game.isStalemate() ? (
                    <div className="text-orange-600 font-semibold text-center">
                        Stalemate
                    </div>
                ) : game.isCheck() ? (
                    <div className="text-purple-600 font-semibold text-center">
                        Check
                    </div>
                ) : (
                    <div className="text-gray-600 flex items-center justify-between">
                        <span>
                            Turn: {game.turn() === "w" ? "White" : "Black"}
                        </span>
                        <span>
                            Fullmove:{" "}
                            {Math.floor(game.history().length / 2) + 1}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoveHistory;
