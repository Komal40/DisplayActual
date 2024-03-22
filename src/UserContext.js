import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
 
const [userData, setUserData]=useState(null)
const [totalLines, setTotalLines]=useState(0)

const setLoginData=(data)=>{
  setUserData(data)
}

const getTotalLines=(data)=>{
  setTotalLines(data)
}

  return (
    <UserContext.Provider value={{
      userData, setLoginData,getTotalLines,totalLines
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



