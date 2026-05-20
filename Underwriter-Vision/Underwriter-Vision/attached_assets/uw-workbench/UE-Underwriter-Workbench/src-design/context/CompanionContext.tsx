import { createContext, useContext, useState } from "react";

interface CompanionContextValue {
  selectedProducts: string[];
  setSelectedProducts: (products: string[]) => void;
}

const CompanionContext = createContext<CompanionContextValue>({
  selectedProducts: [],
  setSelectedProducts: () => {},
});

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  return (
    <CompanionContext.Provider value={{ selectedProducts, setSelectedProducts }}>
      {children}
    </CompanionContext.Provider>
  );
}

export const useCompanion = () => useContext(CompanionContext);
