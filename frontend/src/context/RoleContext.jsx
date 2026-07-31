import { createContext } from 'react';

export const RoleContext = createContext();

export const RoleProvider = ({ children, role }) => {
  return (
    <RoleContext.Provider value={{ role }}>
      {children}
    </RoleContext.Provider>
  );
};
