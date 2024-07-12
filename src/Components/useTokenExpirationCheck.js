import { useState, useEffect } from "react";

const useTokenExpirationCheck = (token, navigate) => {
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const expirationTimeInSeconds = decodedToken.exp;
      const expirationDate = new Date(expirationTimeInSeconds * 1000);
      const currentDate = new Date();
      //   const expirationDate = new Date(decodedToken.exp * 1000);
      console.log("object expiration", expirationDate);
      console.log("object currentdate", currentDate);
      console.log("Expiration date time:", expirationDate.getTime());
      console.log("Current date time:", currentDate.getTime());

      // Check if the token is expired
      if (currentDate > expirationDate) {
        setTokenExpired(true);
      } else {
        // If the token is not expired, calculate the remaining time until expiration
        const timeUntilExpiration =
          expirationDate.getTime() - currentDate.getTime();

        // Set a timeout to update the tokenExpired state when the token expires
        const timeoutId = setTimeout(() => {
          setTokenExpired(true);
        }, timeUntilExpiration);

        // Clean up the timeout when the component unmounts or when the token changes
        return () => clearTimeout(timeoutId);
      }
    }
  }, [token]);

  useEffect(() => {
    // Redirect to login page if token is expired
    if (tokenExpired) {
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("Token");
      localStorage.removeItem("TotalLines");
      localStorage.removeItem("Login");
      localStorage.removeItem("floor_no");
      localStorage.removeItem("approvedNotifications");
      localStorage.removeItem("stationData");
      navigate("/");
    }
  }, [tokenExpired, navigate]);

  return tokenExpired;
};

export default useTokenExpirationCheck;
