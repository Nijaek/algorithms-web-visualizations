"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ComplexityMeta } from "@/types/complexity";

interface AlgorithmContextValue {
  complexity: ComplexityMeta | null;
  setComplexity: (meta: ComplexityMeta) => void;
}

const AlgorithmContext = createContext<AlgorithmContextValue>({
  complexity: null,
  setComplexity: () => {},
});

export function AlgorithmProvider({ children }: { children: React.ReactNode }) {
  const [complexity, setComplexityState] = useState<ComplexityMeta | null>(null);

  const setComplexity = useCallback((meta: ComplexityMeta) => {
    setComplexityState(meta);
  }, []);

  return (
    <AlgorithmContext.Provider value={{ complexity, setComplexity }}>
      {children}
    </AlgorithmContext.Provider>
  );
}

export function useAlgorithm() {
  return useContext(AlgorithmContext);
}
