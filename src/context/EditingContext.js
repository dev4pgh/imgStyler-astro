import React, { createContext, useContext } from "react";

const EditingContext = createContext(null);

export function useEditingContext() {
  const context = useContext(EditingContext);
  if (!context) {
    throw new Error("useEditingContext must be used within an EditingProvider");
  }
  return context;
}

export const EditingProvider = EditingContext.Provider;
