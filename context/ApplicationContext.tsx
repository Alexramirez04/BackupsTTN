import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definir la interfaz para el contexto
interface ApplicationContextType {
  applicationId: string | null;
  setApplicationId: (id: string) => void;
}

// Crear el contexto con un valor predeterminado
const ApplicationContext = createContext<ApplicationContextType>({
  applicationId: null,
  setApplicationId: () => {},
});

// Hook personalizado para usar el contexto
export const useApplication = () => useContext(ApplicationContext);

// Proveedor del contexto
interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [applicationId, setApplicationId] = useState<string | null>(null);

  return (
    <ApplicationContext.Provider value={{ applicationId, setApplicationId }}>
      {children}
    </ApplicationContext.Provider>
  );
};
