"use client";

import { useMemo } from "react";

interface BoardStyles {
  customDarkSquareStyle: { backgroundColor: string };
  customLightSquareStyle: { backgroundColor: string };
  animationDuration: number;
}

export default function useBoardStyles(): BoardStyles {
  return useMemo(
    () => ({
      customDarkSquareStyle: { backgroundColor: "#8aad6a" },
      customLightSquareStyle: { backgroundColor: "#f0e9c5" },
      animationDuration: 200,
    }),
    []
  );
}