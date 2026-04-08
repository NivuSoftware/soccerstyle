import { createContext, useContext, useState, ReactNode } from "react";

interface SizeContextType {
  selectedSize: number | null;
  setSelectedSize: (size: number | null) => void;
}

const SizeContext = createContext<SizeContextType>({ selectedSize: null, setSelectedSize: () => {} });

export const useSizeContext = () => useContext(SizeContext);

export const SizeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  return (
    <SizeContext.Provider value={{ selectedSize, setSelectedSize }}>
      {children}
    </SizeContext.Provider>
  );
};
