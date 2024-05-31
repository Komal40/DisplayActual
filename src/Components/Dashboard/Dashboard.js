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
  const { getTotalLines } = useUser();

  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
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
          // Set totalLines in local storage
          localStorage.setItem("TotalLines", totalLines);
          getTotalLines(totalLines);

          setStationData({
            stations: stations,
            lines: lines,
            totalLines: totalLines,
          });
          localStorage.setItem('stationData', JSON.stringify({
            stations: stations
          }));
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

// websocket
  useEffect(() => {
    const link = "ws://192.168.1.2:5000";

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

     // Send messages after the socket connection is established
     socket.on("connect", () => {
      console.log("WebSocket connected");
      socket.emit( "set_filter", floor_no);
    });

    socket.on("update_work_for_operator", (data) => {
      console.log("Received update from WebSocket:", data);
      setProcessData(data.all_stations_data);
    });

   
    return () => {
      socket.disconnect(); // Cleanup on component unmount
    };
  }, []);


  const handleLineClick = async (line) => {
    // line=G01 F02 L01
    const data = parseInt(line.split("L")[1]);
    setSelectedLine(data);

    // Extract the line number from the line name
    const lineNumber = parseInt(line.split("L")[1]);

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/refresh_data";
    const fullLink = link + endPoint;
    // Filter station data to include only stations belonging to the selected line
    const lineStationsIds = Object.entries(stationData.stations)
      .filter(([key]) => parseInt(key.split("L")[1]) === lineNumber)
      .map(([, stations]) => stations)
      .flat();

    // Prepare the payload
    const payload = {
      stations_ids: lineStationsIds,
    };

    try {
      const response = await fetch(fullLink, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Handle successful response
        const responseData = await response.json();
        console.log("API response: of sending operator data", responseData);
        setEmployeeData(responseData.Datas);
      } else {
        // Handle error response
        console.error("API error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Initially fetch data for line L01
  useEffect(() => {
    // if (stationData && Object.keys(stationData).length > 0) {
    //   const lineL01 = stationData.lines.find((line) => line.includes("L01"));
    // console.log(lineL01)
    //   if (lineL01) {
    //     handleLineClick(lineL01);
    //   }
    // }


    if (stationData && stationData.lines && stationData.lines.length > 0) {
      const firstLine = stationData.lines[0];
      const lineCode = firstLine.split(" ")[2];
      console.log(lineCode); // Output: L01
      handleLineClick(firstLine);
  }
  }, [stationData]);

//   // Function to store stationData in localStorage
// const storeStationDataInLocalStorage = (stationData) => {
//   localStorage.setItem('stationData', JSON.stringify(stationData));
// };
 
  // const handleLineClick = (line) => {
  //   const data = parseInt(line.split("L")[1]);
  //   setSelectedLine(data);

  //   const refreshData=async() =>{
  //     const link = process.env.REACT_APP_BASE_URL;
  //     const endPoint = "/floorincharge/refresh_data";
  //     const fullLink = link + endPoint;

  //     // try {
  //       // const params = new URLSearchParams();
  //       // params.append("floor_no", floor_no);
  //       // const response = await fetch(fullLink, {
  //       //   method: "POST",
  //       //   body: params,

  // try {
  //   // Filter station data to include only stations belonging to the specified line
  //   const lineStationsData = Object.entries(stationData.stations)
  //   .filter(([line]) => parseInt(line.split("L")[1]) === selectedLine)
  //   .map(([, stations]) => stations)
  //   .flat();

  // // Extract only the station IDs
  // const stationIds = lineStationsData.map((station) => station.station_id);

  //   const response = await fetch(fullLink, {
  //     method: "POST",
  //     body: JSON.stringify({ station_ids: stationIds }),
  //         headers: {
  //           "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.ok) {
  //         const responseData = await response.json();
  //         console.log("responseData employee data", responseData);

  //         // Parse employee data and unassigned stations
  //         // const employeeDatas = JSON.parse(responseData.employee_data);
  //         // const unassignedStations = responseData["station_ids where no task assigend"];
  //         // setEmployeeData(employeeDatas);
  //         // setUnassignedStations(unassignedStations);

  //         // Parse employee data
  //         const employeeDataString = responseData.employee_data.replace(
  //           /'/g,
  //           '"'
  //         ); // Replace single quotes with double quotes
  //         const employeeData = JSON.parse(employeeDataString);

  //         // Set the state variables
  //         setEmployeeData(employeeData);
  //         setUnassignedStations(
  //           responseData["station_ids where no task assigend"]
  //         );
  //       } else {
  //         const errorData = await response.text();
  //         console.error("API Error:", errorData);
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };

  //   refreshData()
  // };

  const getLineNumber = (line) => {
    // Extract the last part of the line string and convert it to a number
    const lineNumber = parseInt(line.split("L")[1]);
    return isNaN(lineNumber) ? "" : `Line ${lineNumber}`;
  };

  console.log("processData", processData);
  console.log("object stationData", stationData);

  const [employeeData, setEmployeeData] = useState({});
  const [unassignedStations, setUnassignedStations] = useState([]);

  // const refreshData=async() =>{
  //     const link = process.env.REACT_APP_BASE_URL;
  //     const endPoint = "/floorincharge/refresh_data";
  //     const fullLink = link + endPoint;

  //     // try {
  //       // const params = new URLSearchParams();
  //       // params.append("floor_no", floor_no);

  //       // const response = await fetch(fullLink, {
  //       //   method: "POST",
  //       //   body: params,

  // try {
  //   // Filter station data to include only stations belonging to the specified line
  //   const lineStationsData = Object.entries(stationData.stations)
  //   .filter(([line]) => parseInt(line.split("L")[1]) === selectedLine)
  //   .map(([, stations]) => stations)
  //   .flat();

  // // Extract only the station IDs
  // const stationIds = lineStationsData.map((station) => station.station_id);

  //   const response = await fetch(fullLink, {
  //     method: "POST",
  //     body: JSON.stringify({ station_ids: stationIds }),
  //         headers: {
  //           "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.ok) {
  //         const responseData = await response.json();
  //         console.log("responseData employee data", responseData);

  //         // Parse employee data and unassigned stations
  //         // const employeeDatas = JSON.parse(responseData.employee_data);
  //         // const unassignedStations = responseData["station_ids where no task assigend"];
  //         // setEmployeeData(employeeDatas);
  //         // setUnassignedStations(unassignedStations);

  //         // Parse employee data
  //         const employeeDataString = responseData.employee_data.replace(
  //           /'/g,
  //           '"'
  //         ); // Replace single quotes with double quotes
  //         const employeeData = JSON.parse(employeeDataString);

  //         // Set the state variables
  //         setEmployeeData(employeeData);
  //         setUnassignedStations(
  //           responseData["station_ids where no task assigend"]
  //         );
  //       } else {
  //         const errorData = await response.text();
  //         console.error("API Error:", errorData);
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };

  useEffect(() => {
    console.log("employeeDatahgbhvhv hghghghb bhhjbjhb ", employeeData);
  }, [employeeData]);

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
                style={{
                  display:
                    selectedLine == `${parseInt(line.split("L")[1])}`
                      ? "block"
                      : "none",
                }}
              >
                <Line
                  no={parseInt(line.split("L")[1])}
                  length={stations.length}
                  partData={
                    employeeData.length > 0
                      ? employeeData[0].part_data // Assuming employeeData is an array
                      : [] // Default empty array if employeeData is empty
                  }
                  processData={processData.filter((data) =>
                    stations.includes(data.station_id)
                  )}
                />

                <div className="dashboard_stations">
                  {stations.map((station, index) => {
                    const stationProcessData = processData.filter(
                      (data) => data.station_id == station
                    );

                    console.log(
                      "object station process data",
                      stationProcessData
                    );
                    // Check if stationProcessData is not empty before accessing its properties
                    const shift =
                      stationProcessData.length > 0
                        ? stationProcessData[0].shift
                        : "";
                    const passed =
                      stationProcessData.length > 0
                        ? stationProcessData[0].passed
                        : 0;
                    const failed =
                      stationProcessData.length > 0
                        ? stationProcessData[0].failed
                        : 0;
                    const startTime =
                      stationProcessData.length > 0
                        ? stationProcessData[0].start_shift_time
                        : "";
                    const endTime =
                      stationProcessData.length > 0
                        ? stationProcessData[0].end_shift_time
                        : "";

                    // Find employee associated with this station
                    // const employee = employeeData.find((employee) =>
                    //   employee.stations.includes(station)
                    // );

                    // // Initialize variables for employee information
                    // let operatorName = "";
                    // let operatorSkill = "";
                    // let process_data=""

                    // // If employee is found, assign operator's name and skill
                    // if (employee) {
                    //   operatorName = `${employee.fName} ${employee.lName}`;
                    //   operatorSkill = employee.skill_level;
                    //   process_data=employee.process_data
                    // }

                    // Find employee data for this station
                    const employeeDataForStation = employeeData[station];

                    return (
                      <div className="operator_line" key={index}>
                        <div
                          className="operator_container1"
                          style={{
                            backgroundColor: passed + failed == 0 ? "#aaa" : "",
                          }}
                        >
                          {/* <div>
                            <h4>Shift Timings</h4>
                            {startTime && endTime && (
                              <h5>{`(${startTime} - ${endTime})`}</h5>
                            )}
                            <p className="operator_content">
                              Operator&nbsp;:&nbsp; <h4>{}</h4>
                            </p>
                            <p className="operator_content">
                              Operator Skill:&nbsp;&nbsp;
                              <h4>{}</h4>
                            </p>
                            <p className="operator_content">
                              Station :&nbsp;&nbsp; <h4>{station}</h4>
                            </p>
                            <p className="operator_content">
                              Part :&nbsp;&nbsp;<h4>{}</h4>                              
                            </p>
                            <p className="operator_content">
                              Process :&nbsp;&nbsp;<h4>{}</h4>
                            </p>
                           
                            <p className="operator_content">
                              Shift :&nbsp;&nbsp;<h4>{shift}</h4>
                            </p>
                          </div> */}

                          <div>
                            <h4>Shift Timings</h4>
                            {startTime && endTime && (
                              <h5>{`(${startTime} - ${endTime})`}</h5>
                            )}
                            <p>
                              Station Id:&nbsp;&nbsp;
                              <strong>{station}</strong>
                            </p>
                            {employeeDataForStation ? (
                              employeeDataForStation.map(
                                (employee, empIndex) => (
                                  <div key={empIndex}>
                                    <p>
                                      Operator:&nbsp;&nbsp;
                                      <strong>
                                        {employee.fName || ""}{" "}
                                        {employee.lName || ""}
                                      </strong>
                                    </p>
                                    <p>
                                      Operator Skill:&nbsp;&nbsp;
                                      <strong>
                                        {employee.skill_level || ""}
                                      </strong>
                                    </p>

                                    <p>
                                      Part:&nbsp;&nbsp;
                                      <strong>{employee.parts_no || ""}</strong>
                                    </p>
                                    <p>
                                      Process:&nbsp;&nbsp;
                                      <strong>
                                        {employee.process_no || ""}
                                      </strong>
                                    </p>
                                  </div>
                                )
                              )
                            ) : (
                              <div>
                                <p>
                                  Operator:&nbsp;&nbsp;
                                  <strong>{""}</strong>
                                </p>
                                <p>
                                  Operator Skill:&nbsp;&nbsp;
                                  <strong>{""}</strong>
                                </p>
                                <p>
                                  Part:&nbsp;&nbsp;
                                  <strong>{""}</strong>
                                </p>
                                <p>
                                  Process:&nbsp;&nbsp;
                                  <strong>{""}</strong>
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="operator_below_content">
                            {passed + failed} Done&nbsp;&nbsp;
                            <span>{passed || 0} Pass&nbsp;</span>
                            <span>{failed || 0} Fail&nbsp;</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
      </div>
    </>
  );
}
