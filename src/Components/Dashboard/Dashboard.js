import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Line from "../Line/Line";
import Operator from "../Operator/Operator";
import DashboardR from "../DashboardR/DashboardR";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [stationData, setStationData] = useState({});
  const [selectedLine, setSelectedLine] = useState("");
  const [activeLine, setActiveLine] = useState(null);

  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  console.log("object token", token);
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  //   const expirationTimeInSeconds = decodedToken.exp;
  //   // const expirationDate = new Date(expirationTimeInSeconds * 1000);
  const expirationDate = new Date(decodedToken.exp * 1000);
  console.log("object expiration", expirationDate);
  console.log("object currentdate", currentDate);
  console.log("Expiration date time:", expirationDate.getTime());
  console.log("Current date time:", currentDate.getTime());
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const expirationTimeInSeconds = decodedToken.exp;
      const expirationDate = new Date(expirationTimeInSeconds * 1000);
      const currentDate = new Date();

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
      // toast.error("Your session has expired. Please log in again.");
      alert("Your session has expired. Please log in again.");
      console.log("Token expired. Redirecting to login page.");
      localStorage.removeItem("Token");
      localStorage.removeItem("Login");
      navigate("/");
    }
  }, [tokenExpired, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const link = process.env.REACT_APP_BASE_URL;
      const endPoint = "/floorincharge/stations_info";
      const fullLink = link + endPoint;

      try {
        const params = new URLSearchParams();
        params.append("floor_no", "G01 F02");

        const response = await fetch(fullLink, {
          method: "POST",
          body: params,
          headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(
          "Is current date greater than expiration date?",
          currentDate > expirationDate
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log("object response data", responseData);
          // Parse All_stations
          const stationsString = responseData.All_stations.replace(/'/g, '"');
          const stations = JSON.parse(stationsString);
          // Parse lines
          const linesString = responseData.lines.replace(/'/g, '"');
          const lines = JSON.parse(linesString);
          // Parse totalLines
          const totalLines = parseInt(responseData.totalLines);

          setStationData({
            stations: stations,
            lines: lines,
            totalLines: totalLines,
          });
        } else {
          const errorData = await response.text();
          console.error("API Error:", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [navigate, token]);

  const handleLineClick = (line) => {
    setSelectedLine(line);
  };

  const getLineNumber = (line) => {
    // Extract the last part of the line string and convert it to a number
    const lineNumber = parseInt(line.split("L")[1]);
    return isNaN(lineNumber) ? "" : `Line ${lineNumber}`;
  };

  return (
    <>
      {/* <ToastContainer /> */}
      <DashboardR />
      {/* <div className="arrow_btn">
        <div className="dashboard_line_buttons">
          {Array.from({ length: stationData.totalLines }).map((_, index) => (
            <button key={index}>Line {index + 1}</button>
          ))}
        </div>
      </div> */}

      <div className="arrow_btn">
        <div className="dashboard_line_buttons">
          {stationData.lines &&
            stationData.lines.map((line, index) => (
              <button key={index} onClick={() => handleLineClick(line)}>
                {getLineNumber(line)}
              </button>
            ))}
        </div>
      </div>

      <div className="stations-container" style={{ marginLeft: "15rem" }}>
        {stationData.stations &&
          Object.entries(stationData.stations).map(
            ([line, stations], index) => (
              <div key={index}>
                <h3>Line: {line}</h3>
                {stations.map((station, index) => (
                  <div className="station-box" key={index}>
                    {station}
                  </div>
                ))}
              </div>
            )
          )}
      </div>
    </>
  );
}
