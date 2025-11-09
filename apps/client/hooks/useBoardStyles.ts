"use client";

import { useMemo } from "react";
import { BoardStyles } from "@/types";

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