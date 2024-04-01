import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Line from "../Line/Line";
import Operator from "../Operator/Operator";
import DashboardR from "../DashboardR/DashboardR";
import { useNavigate, useSubmit } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io as socketIOClient } from "socket.io-client";
import { useUser } from "../../UserContext";
import useTokenExpirationCheck from "../useTokenExpirationCheck";

export default function Dashboard() {
  const [stationData, setStationData] = useState({});
  const [selectedLine, setSelectedLine] = useState(1);
  const [processData, setProcessData] = useState([]);
  const [activeLine, setActiveLine] = useState(null);
  const [socket, setSocket] = useState(null);
  const {getTotalLines}=useUser()

  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
 const floor_no=JSON.parse(localStorage.getItem('floor_no'))
  console.log("object token", token);
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  //   const expirationTimeInSeconds = decodedToken.exp;
  //   // const expirationDate = new Date(expirationTimeInSeconds * 1000);
  const expirationDate = new Date(decodedToken.exp * 1000);
  // console.log("object expiration", expirationDate);
  // console.log("object currentdate", currentDate);
  // console.log("Expiration date time:", expirationDate.getTime());
  // console.log("Current date time:", currentDate.getTime());
  // const [tokenExpired, setTokenExpired] = useState(false);

   // Call the custom hook
   const tokenExpired = useTokenExpirationCheck(token, navigate);

  // useEffect(() => {
  //   if (token) {
  //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
  //     const expirationTimeInSeconds = decodedToken.exp;
  //     const expirationDate = new Date(expirationTimeInSeconds * 1000);
  //     const currentDate = new Date();

  //     // Check if the token is expired
  //     if (currentDate > expirationDate) {
  //       setTokenExpired(true);
  //     } else {
  //       // If the token is not expired, calculate the remaining time until expiration
  //       const timeUntilExpiration =
  //         expirationDate.getTime() - currentDate.getTime();

  //       // Set a timeout to update the tokenExpired state when the token expires
  //       const timeoutId = setTimeout(() => {
  //         setTokenExpired(true);
  //       }, timeUntilExpiration);

  //       // Clean up the timeout when the component unmounts or when the token changes
  //       return () => clearTimeout(timeoutId);
  //     }
  //   }
  // }, [token]);

  // useEffect(() => {
  //   // Redirect to login page if token is expired
  //   if (tokenExpired) {
  //     // toast.error("Your session has expired. Please log in again.");
  //     alert("Your session has expired. Please log in again.");
  //     localStorage.removeItem("Token");
  //     localStorage.removeItem("Login");
  //     navigate("/");
  //   }
  // }, [tokenExpired, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const link = process.env.REACT_APP_BASE_URL;
      const endPoint = "/floorincharge/stations_info";
      const fullLink = link + endPoint;

      try {
        const params = new URLSearchParams();
        params.append("floor_no", floor_no);

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
          getTotalLines(totalLines)

          setStationData({
            stations: stations,
            lines: lines,
            totalLines: totalLines,
          });

          console.log("object set station data", setStationData);
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


  useEffect(() => {
    const link = "ws://192.168.1.6:5000";

    // Get the current date
    const currentDate = new Date();

    // Get the current month (returns a number from 0 to 11, where 0 is January)
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 to match the human-readable format

    // Get the current date of the month
    const currentDay = currentDate.getDate();

    // Convert the month and date to strings with leading zeros if necessary
    const formattedMonth =
      currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const formattedDay = currentDay < 10 ? `0${currentDay}` : `${currentDay}`;

    // Construct the WebSocket connection URL with query parameters
    const fullUrl = `${link}?month=${encodeURIComponent(
      formattedMonth
    )}&date=${encodeURIComponent(formattedDay)}`;

    const socket = socketIOClient(link, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("update_work_for_operator", (data) => {
      console.log("Received update from WebSocket:", data);
      setProcessData(data.all_stations_data);
    });

    return () => {
      socket.disconnect(); // Cleanup on component unmount
    };
  }, []);

  const handleLineClick = (line) => {
    const data=parseInt(line.split("L")[1])
    setSelectedLine(data);
  };
  

  const getLineNumber = (line) => {
    // Extract the last part of the line string and convert it to a number
    const lineNumber = parseInt(line.split("L")[1]);
    return isNaN(lineNumber) ? "" : `Line ${lineNumber}`;
  };

  console.log("processData",processData)
  console.log("object stationData",stationData)

  return (
    <>
      {/* <ToastContainer /> */}
      <DashboardR />

      <div className="arrow_btn">
        <div className="dashboard_line_buttons">
          {/* {stationData.lines &&
            stationData.lines.map((line, index) => (
              <button key={index} onClick={() => handleLineClick(line)}>
                {`Line ${parseInt(line.split("L")[1])}`}
              </button>
            ))} */}

{stationData.lines &&
  stationData.lines
    .sort((a, b) => {
      // Extract the line numbers from the line names
      const lineA = parseInt(a.split("L")[1]);
      const lineB = parseInt(b.split("L")[1]);
      // Compare the line numbers
      return lineA - lineB;
    })
    .map((line, index) => (
      <button key={index} onClick={() => handleLineClick(line)}>
        {`Line ${parseInt(line.split("L")[1])}`}
      </button>
    ))}
        </div>
      </div>

      <div className="stations-container">       
        {stationData.stations &&
          Object.entries(stationData.stations).map(
            ([line, stations], index) => (
              <div
                key={index}
                style={{ display: selectedLine == `${parseInt(line.split("L")[1])}` ? "block" : "none" }}
              >
                <Line no={parseInt(line.split("L")[1])} />
                <div className="dashboard_stations">
                  {stations.map((station, index) => {
                    const stationProcessData = processData.filter(
                      (data) => data.station_id == station
                    );
                    
                    console.log("object station process data",stationProcessData)
                    // Check if stationProcessData is not empty before accessing its properties
          const shift = stationProcessData.length > 0 ? stationProcessData[0].shift : "Unknown";
          const passed = stationProcessData.length > 0 ? stationProcessData[0].passed : 0;
          const failed = stationProcessData.length > 0 ? stationProcessData[0].failed : 0;
          const startTime=stationProcessData.length>0?stationProcessData[0].start_shift_time:""
          const endTime=stationProcessData.length>0?stationProcessData[0].end_shift_time:""
          
                    return (
                      <div className="operator_line" key={index}>
                        <div className="operator_container1">
                          <div>
                            <h4>Shift Timings</h4>
                            {startTime && endTime && (
                            <h5>{`(${startTime} - ${endTime})`}</h5>
                          )}
                            <p className="operator_content">
                              Operator&nbsp;:&nbsp; <h4>jhvfhvfdnvnfdf</h4>
                            </p>
                            <p className="operator_content">
                              Operator Skill:&nbsp;&nbsp;<h4></h4>
                            </p>
                            <p className="operator_content">
                              Station :&nbsp;&nbsp;{" "}
                              <h4>{station}</h4>
                            </p>
                            <p className="operator_content">
                              Process :&nbsp;&nbsp;<h4></h4>
                            </p>
                            <p className="operator_content">
                              Shift :&nbsp;&nbsp;<h4>{shift}</h4>
                            </p>
                          </div>
                          <div className="operator_below_content">                            
                            Done:{passed+failed } &nbsp;Pass: <span>{passed||0}</span> Fail: <span>{failed||0}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          )}
      </div>
    </>
  );
}
