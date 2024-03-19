import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
 
const [userData, setUserData]=useState(null)

const setLoginData=(data)=>{
  setUserData(data)
}

  return (
    <UserContext.Provider value={{
      userData, setLoginData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};



