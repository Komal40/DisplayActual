import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Line from "../Line/Line";
import Operator from "../Operator/Operator";
import DashboardR from "../DashboardR/DashboardR";
import { useNavigate, useSubmit } from "react-router-dom";
import { io as socketIOClient } from "socket.io-client";
import { useUser } from "../../UserContext";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { MdDashboard } from "react-icons/md";
import { FaChartLine } from "react-icons/fa6";
import ChartComponent from "./ChartForStation";
import { Modal, Button } from "react-bootstrap";

export default function Dashboard() {
  const [stationData, setStationData] = useState({});
  const [selectedLine, setSelectedLine] = useState(1);
  const [processData, setProcessData] = useState([]);
  const [activeLine, setActiveLine] = useState(null);
  const [socket, setSocket] = useState(null);
  const { getTotalLines } = useUser();
  const [stationValues, setStationValues] = useState({});

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
          localStorage.setItem(
            "stationData",
            JSON.stringify({
              stations: stations,
              lines: lines,
              totalLines: totalLines,
            })
          );

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

  const freeStation = async () => {
    try {
      const link = process.env.REACT_APP_BASE_URL;
      const endPoint = "/floorincharge/free_station";
      const fullLink = link + endPoint;

      try {
        const allStationsData = stationData
          ? Object.values(stationData?.stations)
          : []; // Extract all stations from stationData

        // Flatten the array of arrays to get a single array of all station IDs
        const stationIds = allStationsData.flat();

        const response = await fetch(fullLink, {
          method: "POST",
          body: JSON.stringify({ stations_ids: stationIds }), // Send all station IDs in a single request
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Handle success response here
          const data = await response.json();
          console.log("All stations freed successfully");
        } else {
          // Handle error response here
          console.error("Failed to free all stations");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    freeStation();
  }, [stationData]);

  // websocket
  useEffect(() => {
    const link = "192.168.1.5:5000";

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
      socket.emit("set_filter", floor_no);
    });

    socket.on("update_work_for_operator", (data) => {
      console.log("Received update from WebSocket:", data);
      setProcessData(data.all_stations_data);
    });

    return () => {
      socket.disconnect(); // Cleanup on component unmount
    };
  }, []);

  const extractTime = (timeString) => {
    // Split the time string by colon
    const parts = timeString.split(":");
    // Join the first two parts (hours and minutes)
    return `${parts[0]}:${parts[1]}`;
  };

  const [employeeData, setEmployeeData] = useState({});

  const [activeBtn, setActiveBtn] = useState("");
  const handleButtonClick = (line) => {
    handleLineClick(line);
    getChartData(line);
  };

  const handleLineClick = async (line) => {
    // line=G01 F02 L01
    setActiveBtn(line);
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

  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartResData, setChartResData] = useState({});
  const [chartType, setChartType] = useState("xBar"); // 'xBar' or 'r'

  const getChartData = async (line) => {
    console.log("chartline", line);
    const link = process.env.REACT_APP_BASE_URL;
    const chartEndPoint = "/floorincharge/get_30_45_90_days_readings_for_chart";
    const chartFullLink = link + chartEndPoint;
    // Prepare the payload for the chart data API
    // Extract the line number from the line name
    const lineNumber = parseInt(line.split("L")[1]);
    // Filter station data to include only stations belonging to the selected line
    const lineStationsIds = Object.entries(stationData.stations)
      .filter(([key]) => parseInt(key.split("L")[1]) === lineNumber)
      .map(([, stations]) => stations)
      .flat();

    // Prepare the payload for the chart data API
    const stationIdsPayload = {};
    lineStationsIds.forEach((stationId) => {
      const parameters = [];
      if (employeeData[stationId]) {
        employeeData[stationId].forEach((employee) => {
          if (employee.reading_parameters) {
            Object.keys(employee.reading_parameters).forEach((paramKey) => {
              parameters.push(paramKey);
            });
          }
        });
      }
      if (parameters.length > 0) {
        stationIdsPayload[stationId] = parameters;
      }
    });

    const chartPayload = {
      station_ids: stationIdsPayload,
      shift: "A",
      days: 90,
    };

    try {
      const chartResponse = await fetch(chartFullLink, {
        method: "POST",
        body: JSON.stringify(chartPayload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (chartResponse.ok) {
        // Handle successful response
        const chartData = await chartResponse.json();
        console.log("Chart data response:", chartData);
        setChartResData(chartData);
        // Update state with chart data if necessary
      } else {
        // Handle error response
        console.error("Chart API error:", chartResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  // Parsing the API response to get the data for each station
  const parseChartResponse = (response) => {
    const stationData = {};

    Object.keys(response).forEach((date) => {
      Object.keys(response[date]).forEach((station) => {
        if (!stationData[station]) {
          stationData[station] = [];
        }
        Object.keys(response[date][station]).forEach((process) => {
          stationData[station].push({
            date,
            process,
            values: response[date][station][process],
          });
        });
      });
    });

    return stationData;
  };

  const chartData = parseChartResponse(chartResData);

  const processChartData = (data) => {
    const processedData = {};

    Object.keys(data).forEach((date) => {
      const stations = data[date];

      Object.keys(stations).forEach((station) => {
        const parameters = stations[station];

        Object.keys(parameters).forEach((parameter) => {
          const readings = parameters[parameter]
            .map(Number)
            .filter((value) => value !== null);

          const xBar =
            readings.reduce((sum, value) => sum + value, 0) / readings.length;
          const rValue = Math.max(...readings) - Math.min(...readings);

          if (!processedData[station]) {
            processedData[station] = {};
          }

          processedData[station][parameter] = { xBar, rValue };
        });
      });
    });

    return processedData;
  };

  const chartDataz = parseChartResponse({
    "2024-07-03": {
      "G01 F02 L01 S01": {
        "TPMS-01 PR250 014": ["2", "2", "2", "2", "2"],
        "TPMS-01 PR251 014": ["2", "2", "2", "2", "2"],
        "TPMS-01 PR252 014": ["2", "2", "2", "2", "2"],
      },
    },
    "2024-08-06": {
      "G01 F02 L01 S01": {
        "TPMS-01 PR250 014": ["1.998", "1.956", "1.856", "1.755", "2.00"],
      },
    },
    "2024-08-08": {
      "G01 F02 L01 S01": {
        "TPMS-01 PR250 014": ["2", "2", "2", "2", "2"],
        "TPMS-01 PR251 014": ["2", "2", "2", "2", "2"],
      },
    },
    "2024-08-10": {
      "G01 F02 L01 S01": {
        "TPMS-01 PR250 014": ["2", "1.987", "0.685", "1.999", "1.333"],
      },
    },
    "2024-08-16": {
      "G01 F02 L01 S01": {
        "TPMS-01 PR250 014": ["1", "0.3", "1.369", "2", "0.799"],
      },
    },
    "2024-08-21": {
      "G01 F02 L01 S01": {
        "TPMS-01 PR250 014": ["0.123", "0.523", "1.111", "1.999", "0.999"],
      },
    },
  });

  console.log("charts data", chartData);

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Callback to receive chart data
  // const handleChartDataReady = (processedData, station) => {
  //   setStationValues(prevValues => ({
  //     ...prevValues,
  //     [station]: processedData[0] || {} // Assuming processedData has the required structure
  //   }));
  // };
  // Callback to receive chart data
  const handleChartDataReady = (processedData) => {
    const values = processedData.reduce((acc, { date, xBar, r, process }) => {
      if (!acc[process]) {
        acc[process] = { xBar, r };
      }
      return acc;
    }, {});

    setStationValues(values);
  };

  console.log("station values", stationValues);
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
      handleButtonClick(firstLine);
    }
  }, [stationData]);

  // Function to store stationData in localStorage
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

  const [showStations, setShowStations] = useState(true);

  const handleShowStations = () => {
    setShowStations(true);
  };

  const handleShowCharts = () => {
    setShowStations(false);
  };

  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedChartType, setSelectedChartType] = useState("xBar");
  const openModal = (station) => {
    console.log("open modal", station);
    setSelectedStation(station);
    setIsChartModalOpen(true);
  };

  const closeModal = () => {
    setIsChartModalOpen(false);
    setSelectedStation(null);
  };

  // const calculateXBar = (values) => {
  //   const numericValues = values.map(Number); // Convert to numbers
  //   const sum = numericValues.reduce((acc, val) => acc + val, 0);
  //   return (sum / numericValues.length).toFixed(2);
  // };

  // const calculateR = (values) => {
  //   const numericValues = values.map(Number); // Convert to numbers
  //   const max = Math.max(...numericValues);
  //   const min = Math.min(...numericValues);
  //   return (max - min).toFixed(2);
  // };
  const calculateXBar = (values) => {
    const validValues = values.filter(value => value !== null).map(Number);
    if (validValues.length === 5) {
      const sum = validValues.reduce((a, b) => a + b, 0);
      return sum / validValues.length;
    }
    return null;
  };
  
  
  const calculateR = (values) => {
    const validValues = values.filter(value => value !== null).map(Number);
    if (validValues.length === 5) {
      const max = Math.max(...validValues);
      const min = Math.min(...validValues);
      return max - min;
    }
    return null;
  };

  
  return (
    <>
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
                <button
                  className={`${activeBtn == line ? "dashActBtn" : ""}`}
                  key={index}
                  onClick={() => handleButtonClick(line)}
                >
                  {`Line ${parseInt(line.split("L")[1])}`}
                </button>
              ))}
        </div>
        <div className="dashboard_main_symbols">
          <div className="dashboard_sign_main" onClick={handleShowStations}>
            <MdDashboard className="dashboard_sign" />
          </div>
          <div className="dashboard_chart_main" onClick={handleShowCharts}>
            <FaChartLine className="dashboard_chart" />
          </div>
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

                {showStations ? (
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

                      // Get previous station process
                      const prevStation =
                        index > 0 ? stations[index - 1] : null;
                      const futureStation =
                        index < stations.length - 1
                          ? stations[index + 1]
                          : null;

                      const prevProcess =
                        prevStation && employeeData[prevStation]
                          ? employeeData[prevStation][0].process_no
                          : null;

                      // Get current station process
                      const currentProcess = employeeDataForStation
                        ? employeeDataForStation[0].process_no
                        : null;

                      const futureProcess =
                        prevStation && employeeData[futureStation]
                          ? employeeData[futureStation][0].process_no
                          : null;

                      console.log(
                        "employeeDataForStation",
                        employeeDataForStation
                      );
                      console.log(
                        "employeeData[prevStation]",
                        prevProcess,
                        currentProcess,
                        futureProcess,
                        station
                      );

                      const isSameProcess = currentProcess === prevProcess;
                      const isSame = currentProcess === futureProcess;
                      // Check if index is 0 and compare with future process
                      const sameProcess = false;
                      // index == 0
                      //   ? employeeData[futureStation]
                      //     ? employeeData[futureStation][0].process_no
                      //     : null
                      //   : false;

                      return (
                        // <div className="operator_line" key={index}>
                        //   <div
                        //     className="operator_container1"
                        //     style={{
                        //       backgroundColor: passed + failed == 0 ? "#aaa" : "",
                        //     }}
                        //   >
                        //     <div>
                        //       <h4>Shift Timings</h4>
                        //       {startTime && endTime && (
                        //         <h5>{`(${startTime} - ${endTime})`}</h5>
                        //       )}
                        //       <p>
                        //         Station Id:&nbsp;&nbsp;
                        //         <strong>{station}</strong>
                        //       </p>
                        //       {employeeDataForStation ? (
                        //         employeeDataForStation.map(
                        //           (employee, empIndex) => (
                        //             <div key={empIndex}>
                        //                 <p>
                        //                 Assigned Task:&nbsp;&nbsp;
                        //                 <strong>
                        //                   {employee.total_assigned_task || ""}
                        //                 </strong>
                        //               </p>
                        //               <p>
                        //                 Operator:&nbsp;&nbsp;
                        //                 <strong>
                        //                   {employee.fName || ""}{" "}
                        //                   {employee.lName || ""}
                        //                 </strong>
                        //               </p>
                        //               <p>
                        //                 Operator Skill:&nbsp;&nbsp;
                        //                 <strong>
                        //                   {employee.skill_level || ""}
                        //                 </strong>
                        //               </p>

                        //               <p>
                        //                 Part:&nbsp;&nbsp;
                        //                 <strong>{employee.parts_no || ""}</strong>
                        //               </p>
                        //               <p>
                        //                 Process:&nbsp;&nbsp;
                        //                 <strong>
                        //                   {employee.process_no || ""}
                        //                 </strong>
                        //               </p>
                        //             </div>
                        //           )
                        //         )
                        //       ) : (
                        //         <div>
                        //           <p>
                        //             Operator:&nbsp;&nbsp;
                        //             <strong>{""}</strong>
                        //           </p>
                        //           <p>
                        //             Operator Skill:&nbsp;&nbsp;
                        //             <strong>{""}</strong>
                        //           </p>
                        //           <p>
                        //             Part:&nbsp;&nbsp;
                        //             <strong>{""}</strong>
                        //           </p>
                        //           <p>
                        //             Process:&nbsp;&nbsp;
                        //             <strong>{""}</strong>
                        //           </p>
                        //         </div>
                        //       )}
                        //     </div>
                        //     <div className="operator_below_content">
                        //       {passed + failed} Done&nbsp;&nbsp;
                        //       <span>{passed || 0} Pass&nbsp;</span>
                        //       <span>{failed || 0} Fail&nbsp;</span>
                        //     </div>
                        //   </div>
                        // </div>

                        <div className={`operator_line `}>
                          {employeeDataForStation ? (
                            employeeDataForStation.map((employee, empIndex) => {
                              return (
                                <>
                                  <div className={`home`}>
                                    <div className="card_container">
                                      <div className="upper_row">
                                        <div className="upper_div_row">
                                          <p>{station}</p>
                                          {startTime && endTime && (
                                            <p>{`(${extractTime(
                                              startTime
                                            )}-${extractTime(endTime)})`}</p>
                                          )}
                                        </div>
                                      </div>
                                      {/* ${isSameProcess ? "blue-color" : ""} */}
                                      <div
                                        className={`mid_row ${
                                          isSameProcess || isSame || sameProcess
                                            ? "blue-color"
                                            : ""
                                        }`}
                                      >
                                        <p>{employee.parts_no}</p>
                                        <p>{employee.process_no}</p>
                                        <hr className="divider" />
                                        <div className="mid_employee">
                                          <p>{employee.employee_id}</p>
                                          <p>{employee.total_assigned_task}</p>
                                        </div>
                                        <div className="skill_metrix">
                                          <p>
                                            {employee.fName || ""}&nbsp;
                                            {employee.lName || ""} -- L
                                            {employee.skill_level}
                                          </p>
                                          <div className="color_bar">
                                            {employee.skill_level >= 1 && (
                                              <div className="color_red"></div>
                                            )}
                                            {employee.skill_level >= 2 && (
                                              <div className="color_orange"></div>
                                            )}
                                            {employee.skill_level >= 3 && (
                                              <div className="color_yellow"></div>
                                            )}
                                            {employee.skill_level >= 4 && (
                                              <div className="color_green"></div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="bottom_row">
                                        <div className="bottom_section green">
                                          <p>{passed || 0}</p>
                                        </div>
                                        <div className="bottom_section red">
                                          <p>{failed || 0}</p>
                                        </div>
                                        <div className="bottom_section blue">
                                          <select>
                                            <option></option>
                                            <option>1</option>
                                            <option>2</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            })
                          ) : (
                            <div className={`home grey-color`}>
                              <div className="card_container">
                                <div className="upper_row">
                                  <div className="upper_div_row">
                                    <p>{station}</p>
                                  </div>
                                </div>
                                <div className="mids_row">
                                  <p></p>
                                  <p style={{ textAlign: "center" }}>
                                    No Job Assigned
                                  </p>
                                  {/* <hr className="divider" /> */}
                                  <p></p>
                                  <p></p>
                                  {/* <div className="color_bar">
                                        <div className="color_red"></div>
                                        <div className="color_orange"></div>
                                        <div className="color_yellow"></div>
                                        <div className="color_green"></div>
                                      </div> */}
                                </div>
                                <div className="bottom_row">
                                  <div className="bottom_section green">
                                    <p></p>
                                  </div>
                                  <div className="bottom_section red">
                                    <p></p>
                                  </div>
                                  <div className="bottom_section blue">
                                    <select>
                                      <option></option>
                                      <option>1</option>
                                      <option>2</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // chart component
                  <>
                    {/* <div className="chart_type_selector">
    <button onClick={() => handleChartTypeChange('xBar')}>X-bar Chart</button>
    <button onClick={() => handleChartTypeChange('r')}>R Chart</button>
  </div> */}
                    <div className="dashboard_stations">
                      <div style={{ marginBottom: "1rem" }}>
                        <select
                          value={selectedChartType}
                          onChange={(e) => setSelectedChartType(e.target.value)}
                        >
                          <option value="xBar">X-Bar</option>
                          <option value="r">R</option>
                        </select>
                      </div>
                      {stations.map((station, index) => {
                        const employeeDataForStation = employeeData[station];
                        const chartDataForStation = chartData[station] || [];
                        const stationStats = stationValues[station] || {};

                        console.log("chartDataForStation", chartDataForStation);

                        return (
                          <div
                            className={`operator_line `}
                            onClick={() => openModal(station)}
                          >
                            {employeeDataForStation ? (
                              employeeDataForStation.map(
                                (employee, empIndex) => {
                                  return (
                                    <>
                                      <div className={`home`}>
                                        <div className="card_chart_container">
                                          <div className="upper_chart_rw">
                                            <div className="upper_chart_row">
                                              <p>{station}</p>
                                              <p>Air Pressure 2-4M/KM</p>
                                            </div>
                                            <div className="chart_box"></div>
                                          </div>

                                          <div className={`mid_row`}>
                                            {chartDataForStation.length > 0 ? (
                                              <ChartComponent
                                                data={chartDataForStation.map(
                                                  (data) => ({
                                                    name: data.date,
                                                    [selectedChartType]:
                                                      selectedChartType ===
                                                      "xBar"
                                                        ? calculateXBar(
                                                            data.values
                                                          )
                                                        : calculateR(
                                                            data.values
                                                          ),
                                                  })
                                                )}
                                                type={selectedChartType}
                                              />
                                            ) : (
                                              <p
                                                style={{ textAlign: "center" }}
                                              >
                                                No Chart Available
                                              </p>
                                            )}
                                          </div>
                                          <div className="bottom_row">
                                            <div className="bottom_section grey">
                                              <p>R:{stationStats.r || ""}</p>
                                            </div>
                                            <div className="bottom_section lightgrey">
                                              <p>X:{stationStats.xBar}</p>
                                            </div>
                                            <div className="bottom_section grey">
                                              <p>CFK:10</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  );
                                }
                              )
                            ) : (
                              <div className={`home`}>
                                <div className="card_chart_container">
                                  <div className="upper_chart_rw">
                                    <div className="upper_chart_row">
                                      <p>{station}</p>
                                      <p></p>
                                    </div>
                                    <div></div>
                                  </div>

                                  <div className={`mid_row`}>
                                    <p style={{ textAlign: "center" }}>
                                      No Chart Available
                                    </p>
                                  </div>
                                  <div className="bottom_row">
                                    <div className="bottom_section grey">
                                      <p></p>
                                    </div>
                                    <div className="bottom_section lightgrey">
                                      <p></p>
                                    </div>
                                    <div className="bottom_section grey">
                                      <p></p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div>
                        {
                          <Modal
                            show={isChartModalOpen}
                            onHide={closeModal}
                            backdrop={true} // Enables closing the modal when clicking outside
                            keyboard={true} // Allows closing the modal with the ESC key
                            centered
                          >
                            <Modal.Header
                              closeButton
                              className="custom-modal-header"
                            >
                              <Modal.Title>
                                Charts for {selectedStation}
                              </Modal.Title>
                              <button
                                type="button"
                                className="close"
                                onClick={closeModal}
                              >
                                &times; {/* This is the "×" symbol */}
                              </button>
                            </Modal.Header>
                            <Modal.Body>
                              {/* <h5>X-Bar Chart</h5>
      {chartData[selectedStation] && chartData[selectedStation].length > 0 ? (
        <ChartComponent data={chartData[selectedStation].filter(data => data.type === 'xBar')} />
      ) : (
        <p>No X-Bar Chart Data Available</p>
      )}
      <h5>R Chart</h5>
      {chartData[selectedStation] && chartData[selectedStation].length > 0 ? (
        <ChartComponent data={chartData[selectedStation].filter(data => data.type === 'r')} />
      ) : (
        <p>No R Chart Data Available</p>
      )} */}
                              {chartData[selectedStation] &&
                              chartData[selectedStation].length > 0 ? (
                                <>
                                  <div>
                                    <h5>X-Bar Chart</h5>
                                    <ChartComponent
                                      data={chartData[selectedStation].map(
                                        (data) => ({
                                          name: data.date,
                                          xBar: calculateXBar(data.values),
                                        })
                                      )}
                                      type="xBar"
                                      process={
                                        chartData[selectedStation][0].process
                                      }
                                    />
                                  </div>
                                  <div>
                                    <h5>R Chart</h5>
                                    <ChartComponent
                                      data={chartData[selectedStation].map(
                                        (data) => ({
                                          name: data.date,
                                          r: calculateR(data.values),
                                        })
                                      )}
                                      type="r"
                                      process={
                                        chartData[selectedStation][0].process
                                      }
                                    />
                                  </div>
                                </>
                              ) : (
                                <p>No Chart Data Available</p>
                              )}
                            </Modal.Body>
                            <Modal.Footer></Modal.Footer>
                          </Modal>
                        }
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          )}
      </div>
    </>
  );
}
