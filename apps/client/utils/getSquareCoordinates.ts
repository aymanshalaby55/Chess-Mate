import { Square } from "chess.js";

const getSquareCoordinates = (
  square: Square,
  orientation: "white" | "black"
) => {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
  const rank = 8 - parseInt(square[1]); // 8=0, 7=1, etc.

  const normalizedFile = orientation === "white" ? file : 7 - file;
  const normalizedRank = orientation === "white" ? rank : 7 - rank;

  return {
    left: `${(normalizedFile + 0.5) * BOARD_SIZE_PERCENTAGE}%`,
    top: `${(normalizedRank + 0.5) * BOARD_SIZE_PERCENTAGE}%`,
  };
};

export default getSquareCoordinates;
