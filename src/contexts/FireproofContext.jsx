import React, { createContext, useContext } from "react";
import { useFireproof } from "use-fireproof";

// Create the context
const FireproofContext = createContext(null);

// Provider component
export function FireproofProvider({ children }) {
  const { database, useDocument, useLiveQuery } = useFireproof("movie-explorer-db");

  return (
    <FireproofContext.Provider value={{ database, useDocument, useLiveQuery }}>
      {children}
    </FireproofContext.Provider>
  );
}

// Custom hook for easy access
export function useFireproofContext() {
  const ctx = useContext(FireproofContext);
  if (!ctx) throw new Error("useFireproofContext must be used within a FireproofProvider");
  return ctx;
}
