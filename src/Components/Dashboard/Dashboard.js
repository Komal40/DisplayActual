import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Line from "../Line/Line";
import Operator from "../Operator/Operator";
import DashboardR from "../DashboardR/DashboardR";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";


export default function Dashboard() {
  const [stationData, setStationData] = useState({});
  const [selectedLine, setSelectedLine] = useState("1");
  const [activeLine, setActiveLine] = useState(null);
  const [socket, setSocket] = useState(null);

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


  useEffect(() => {
    // Initialize WebSocket connection using socket.io-client
    const socket = io("ws://192.168.1.6:5000");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("message", (data) => {
      console.log("Data received from WebSocket server:", data); // Log the received data
      if (data.event === "update_work_for_operator") {
        // Update station data based on the received data
        updateStationData(data.data);
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed");
    });

    setSocket(socket);

    return () => {
      // Close WebSocket connection when component unmounts
      socket.close();
    };
  }, []);


  const updateStationData = (updatedData) => {
    setStationData((prevData) => {
      const updatedStations = prevData.stations.map((station) => {
        const updatedStation = updatedData.find(
          (data) => data.station_id == station.station_id
        );
        if (updatedStation) {
          // Update station data if the station ID matches
          return {
            ...station,
            passed: updatedStation.passed || station.passed || 0,
            failed: updatedStation.failed || station.failed || 0,
          };
        } else {
          return station;
        }
      });
      return { ...prevData, stations: updatedStations };
    });
  };
  






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

      <div className="arrow_btn">
        <div className="dashboard_line_buttons">
          {stationData.lines &&
            stationData.lines.map((line, index) => (
              <button key={index} onClick={() => handleLineClick(line)}>
                {`Line ${parseInt(line.split("L")[1])}`}
              </button>
            ))}
        </div>
      </div>
      <div className="stations-container">
        {/* {stationData.stations &&
          Object.entries(stationData.stations).map(
            ([line, stations], index) =>
              selectedLine === line && (
                <div key={index}>
                  <h3>Line: {line}</h3>
                
                  {stations.map((station, index) => (
                    <div className="station-box" key={index}>
                      {station}
                    </div>
                  ))}
                </div>
              )
          )} */}

        {stationData.stations &&
          Object.entries(stationData.stations).map(
            ([line, stations], index) => (
              <div
                key={index}
                style={{ display: selectedLine === line ? "block" : "none" }}
              >
                <Line no={parseInt(line.split("L")[1])} />
                <div className="dashboard_stations"> 
                {stations.map((station, index) => (
                  // <div className="station-box" key={index}>
                   
                      <div className="operator_line" >
                        <div className="operator_container1">
                          <div>
                            <h3>Morning Shift</h3>
                            <p className="operator_content">
                              Operator&nbsp;:&nbsp; <h4>jhvfhvfdnvnfdf</h4>
                            </p>
                            <p className="operator_content">
                              Operator Skill:&nbsp;&nbsp;<h4></h4>
                            </p>
                            <p className="operator_content">
                              Station :&nbsp;&nbsp; <h4>{station.station_id}</h4>
                            </p>
                            <p className="operator_content">
                              Process :&nbsp;&nbsp;<h4></h4>
                            </p>
                          </div>
                          <div className="operator_below_content">
                            
                           {station.passed+station.failed || 0} Done&nbsp;Pass: {station.passed || 0}&nbsp; Fail: {station.failed || 0}&nbsp;
                          </div>
                        </div>
                      </div>
                    // {/* </div> */}
               
                ))}
              </div>
              </div>
            )
          )}
      </div>
    </>
  );
}
