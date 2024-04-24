import React, { startTransition, useEffect, useState } from "react";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { json, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import Line from "../Line/Line";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function TaskNew() {
  const [stationData, setStationData] = useState({});
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);
  const login = JSON.parse(localStorage.getItem("Login"));
  const [selectedLine, setSelectedLine] = useState(1);
  const [parts, setParts] = useState([]);
  const [processes, setProcesses] = useState({});
  const [processName, setProcessName] = useState([]);
  const [previousData, setPreviousData] = useState({});

  // Define state variables to store previous log data and running tasks
  const [runningTasks, setRunningTasks] = useState([]);

  const [selectedParts, setSelectedParts] = useState({});
  const [selectedProcesses, setSelectedProcesses] = useState({});

  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [selectedProcessNo, setSelectedProcessNo] = useState("");

  const [startShiftTime, setStartShiftTime] = useState("");
  const [endShiftTime, setEndShiftTime] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("00:00");

  const [startTimeOptions, setStartTimeOptions] = useState([]);
  const [endTimeOptions, setEndTimeOptions] = useState([]);

  useEffect(() => {
    // Generate options for start and end times
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    const startOptions = generateTimeOptions(currentHour, currentMinute, 24);
    const endOptions = generateTimeOptions(currentHour, currentMinute, 48); // End time options for next 24 hours

    setStartTimeOptions(startOptions);
    setEndTimeOptions(endOptions);
  }, []);

//   function generateTimeOptions(startHour, startMinute, numberOfHours) {
//     const options = [];
//     for (let hour = startHour; hour < startHour + numberOfHours; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         if (hour === startHour && minute < startMinute) {
//           continue; // Skip past times for the start dropdown
//         }
//         const formattedHour = hour < 10 ? "0" + hour : hour;
//         const formattedMinute = minute < 10 ? "0" + minute : minute;
//         const time = `${formattedHour}:${formattedMinute}:00`;
//         options.push(<option key={time}>{time}</option>);
//       }
//     }
//   }

function generateTimeOptions(currentHour, currentMinute, hours) {
    const options = [];
    for (let hour = currentHour; hour < currentHour + hours; hour++) {
      const adjustedHour = hour % 24; // Ensure hour stays within 24-hour format
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${adjustedHour < 10 ? "0" + adjustedHour : adjustedHour}:${
          minute === 0 ? "00" : minute
        }:00`;
        options.push(<option key={time}>{time}</option>);
      }
    }
    return options;
  }



  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const formattedDate = `${selectedDate.getFullYear()}-${
    selectedDate.getMonth() + 1 < 10
      ? "0" + (selectedDate.getMonth() + 1)
      : selectedDate.getMonth() + 1
  }-${selectedDate.getDate()}`;

  const formattedTime = `${selectedTime}:00`;


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

          console.log("object set station data on Task page", setStationData);
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

  const getParts = async (e) => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_parts";
    const fullLink = link + endPoint;

    try {
      const response = await fetch(fullLink, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("param", data.data);
        setParts(data.data);
      } else {
        console.error("Failed to fetch parts");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getParts();
  }, []);

  const handlePartChange = (e, stationId) => {
    const selectedPartNo = e;
    // setSelectedParts(prevParts => ({ ...prevParts, [stationId]: selectedPartNo }));
    // console.log("selectedParts", selectedParts);
    // getProcesses(selectedPartNo, stationId);
    setSelectedParts((prevParts) => {
      const updatedParts = { ...prevParts, [stationId]: selectedPartNo };
      console.log("selectedParts", updatedParts); // Log the updated state
      getProcesses(selectedPartNo, stationId); // Call getProcesses with the new value
      return updatedParts; // Return the updated state
    });
    //   setSelectedProcesses(prevProcesses => ({ ...prevProcesses, [stationId]: "" })); // Reset corresponding process information
  };

  const [selectedSkill, setSelectedSkill]=useState({})
  const handleProcessChange = (e, stationId) => {
    const selectedProcessNo = e.target.value;
    const selectedProcess = processes[stationId].find(process => process.process_no == selectedProcessNo);
  
    setSelectedProcesses((prevProcesses) => ({
      ...prevProcesses,
      [stationId]: selectedProcessNo,
    }));
    if (selectedProcess) {
        setSelectedSkill((prevSkill)=>({
            ...prevSkill,
            [stationId]:selectedProcess.skill_level
        }))
      }
    
    console.log("selectedProcesses", selectedProcesses);
  };

  useEffect(() => {
    // This effect runs every time selectedProcesses changes
    console.log("selectedProcesses", selectedProcesses);
  }, [selectedProcesses]); // Only run this effect when selectedProcesses changes

  const getProcesses = async (partNo, stationId) => {
    // e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_processes";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("part_no", partNo);
      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // setProcessName(data.data);
        const processesData = data.data;
        setProcesses({ ...processes, [stationId]: processesData });
        // setProcessName(processesData);

        console.log("object processName", processesData);
       
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (selectedPartNo) {
      getProcesses(selectedPartNo);
    }
  }, [selectedPartNo]);


  const handleLineClick = async (line) => {
    // line=G01 F02 L01
    const data = parseInt(line.split("L")[1]);
    setSelectedLine(data);

    // Parse the stations data from the state
    const allStations = stationData.stations;
    // Find stations corresponding to the selected line
    const stationsForSelectedLine = allStations[line] || [];
    console.log("stationsForSelectedLine", stationsForSelectedLine);
  };

//   function generateTimeOptions() {
//     const options = [];
//     for (let hour = 0; hour < 24; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const time = `${hour < 10 ? "0" + hour : hour}:${
//           minute === 0 ? "00" : minute
//         }:00`;
//         options.push(<option key={time}>{time}</option>);
//       }
//     }
//     return options;
//   }

  // Function to handle change in start shift time
  const handleStartShiftChange = (e) => {
    setStartShiftTime(e.target.value);
  };

  // Function to handle change in end shift time
  const handleEndShiftChange = (e) => {
    setEndShiftTime(e.target.value);
  };

  //   get previous data on selected date and time
  const getPartAndProcessInfo = async () => {
    // Check if the selected time is empty
    if (selectedTime.trim() === "00:00") {
      toast.error("Please select Time");
      return;
    }
    const formattedDate = `${selectedDate.getFullYear()}-${
      selectedDate.getMonth() + 1 < 10
        ? "0" + (selectedDate.getMonth() + 1)
        : selectedDate.getMonth() + 1
    }-${selectedDate.getDate()}`;

    const formattedTime = `${selectedTime}:00`;

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_stations_previous_data";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("floor_no", floor_no);
      params.append("date", formattedDate);
      params.append("time", formattedTime);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRunningTasks(data.running_task_on_stations || []);
        console.log("data of getiing info on selected date and time", data);
        if (Object.keys(data.Datas).length === 0 && data.running_task_on_stations.length === 0) {
            // Show a toast message indicating that nothing is assigned on that day and time
            toast.info("Nothing assigned on that day and time");
          //     const selectedLineStations = stationData.lines;
          // const blankData = {};
          // selectedLineStations.forEach((station) => {
          //   blankData[station] = [];
          // });
          setPreviousData({});
        } else {
          setPreviousData(data.Datas);
        }
      } else {
        console.error("Failed to fetch part and process info");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const assignTask = async () => {
    // Check if shift timings are selected
    if (!startShiftTime || !endShiftTime) {
      toast.warning("Please select shift timings", { autoClose: 5000 });
      return; // Exit the function early
    }

    // if(userEnteredValue==""){
    //     toast.warning("Please Enter Quantity timings", { autoClose: 5000 });
    //     return;
    // }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/assign_task";
    const fullLink = link + endPoint;

    // Initialize an empty array to store task objects
    const tasksArray = [];

    const lineCode = selectedLine < 10 ? `L0${selectedLine}` : `L${selectedLine}`;

    // Get the selected line
    const selectedLineStations =
      stationData.stations[`${floor_no} ${lineCode}`];

      console.log("object selectedLineStations",selectedLineStations)

    // Check if selectedLineStations is defined and iterable
    if (!selectedLineStations || !Array.isArray(selectedLineStations)) {
      console.error("Selected line stations are undefined or not iterable");
      return;
    }

    selectedLineStations.forEach((station) => {
      // if (previousData.hasOwnProperty(station)) {
      // Extract required data from previousData for the current station
      const [
        firstName,
        lastName,
        skillLevel,
        part,
        process,
        skillRequired,
        employeeid,
      ] = previousData[station] || [];

      // Check if the user has entered values for part, process, and employee ID for the current station
      if (
        (selectedParts[station] &&
          selectedProcesses[station] &&
          selectedEmployees[station]) && (userEnteredValue[station])||
        (part && process && employeeid)
      ) {
        // Create a new task object for the station
        const newTask = {
          station_id: station,
          // employee_id: employeeCode[station] || employeeid ? employeeid:"", // Use user entered value if available, otherwise use value from previousData
          // part_no: selectedParts[station] || part?  part:"", // Use user entered value if available, otherwise use value from previousData
          // process_no: selectedProcesses[station] ||process?process:"" , // Use user entered value if available, otherwise use value from previousData
          employee_id: selectedEmployees[station]
            ? employeeCode[station]
            : employeeid || "", // Use user entered value if available, otherwise use value from previousData
          part_no: selectedParts[station] || part || "", // Use user entered value if available, otherwise use value from previousData
          process_no: selectedProcesses[station] || process || "",
          shift: "A",
          start_shift_time: startShiftTime,
          end_shift_time: endShiftTime,
          assigned_by_owner: login.employee_id,
          total_assigned_task: userEnteredValue[station] || 0,
        };

        // Push the new task object to the tasksArray
        console.log("adding newTask", newTask);
        tasksArray.push(newTask);
      }
    });

    console.log("object tasksArray", tasksArray);

    try {
      // Send a POST request to the server with the tasks data
      const response = await fetch(fullLink, {
        method: "POST",
        body: JSON.stringify(tasksArray),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    if (response.ok) {
        const data = await response.json();
    
        if (Object.keys(data["assigned task to"]).length > 0) {
            // Tasks were assigned successfully to specific stations
            const assignedStations = Object.keys(data["assigned task to"]).join(", ");
            toast.success(`Task assigned successfully to stations: ${assignedStations}`);
    
            // Reset input fields for part and process after successful task assignment
            setSelectedParts({}); // Reset selectedParts state
            setSelectedProcesses({}); // Reset selectedProcesses state
            setSelectedEmployees({}); // Reset selectedEmployees state
            setStartShiftTime(""); // Reset startShiftTime state
            setEndShiftTime(""); // Reset endShiftTime state
        }
    
        if (Object.keys(data["operator_assigned_to_stations"]).length > 0) {
            // Operator(s) is already assigned to stations
            const operatorKeys = Object.keys(data["operator_assigned_to_stations"]);
            operatorKeys.forEach(operator => {
                const stations = data["operator_assigned_to_stations"][operator].join(", ");
                toast.info(`Operator ${operator} already assigned on station ${stations}`, { autoClose: 10000 });
            });
        }
    
        if (Object.keys(data["assigned task to"]).length === 0 && Object.keys(data["operator_assigned_to_stations"]).length === 0) {
            // No tasks were assigned and no operator assigned to stations
            toast.info("Please free all the tasks First", { autoClose: 10000 });
        }
    } else {
        console.error("Failed to assign tasks", response.error);
    }
    
    }

    catch (error) {
      console.error("Error:", error);
    }
  };

  const [userEnteredValue, setUserEnteredValue] = useState({});
  // Modify handleInputChange to update the entered value for the corresponding station
  const handleInputChange = (e, stationId) => {
    const { value } = e.target;
    // Update the state with the entered value for the station
    setUserEnteredValue((prevState) => ({
      ...prevState,
      [stationId]: value,
    }));
  };


  const [runningTaskInitially, setRunningTaskInitially]=useState([])
  useEffect(() => {
    const freeStation = async () => {
      const link = process.env.REACT_APP_BASE_URL;
      const endPoint = "/floorincharge/free_station";
      const fullLink = link + endPoint;

      try {
        const allStationsData = Object.values(stationData.stations); // Extract all stations from stationData

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
          const data=await response.json()
          console.log("All stations freed successfully");
          setRunningTaskInitially(data.task_running_on_stations)
        } else {
          // Handle error response here
          console.error("Failed to free all stations");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    freeStation();
  }, [stationData]);

  const [employeeDetails, setEmployeeDetails] = useState(null);

  const handleEmployeeCodeChange = (event) => {
    setEmployeeCode(event.target.value);
  };

  const renderEmployeeDetails = () => {
    if (employeeDetails) {
      return (
        <div className="task_stations_part">
          <p className="employee-name">
            Employee: {employeeDetails["First Name"]}{" "}
            {employeeDetails["Last Name"]}
          </p>
          <p style={{ fontSize: "12px" }}>
            Skill: {employeeDetails["Skill Level"]}
          </p>
        </div>
      );
    }
    return null;
  };

  //   particular employee details from employee code
  const [selectedEmployees, setSelectedEmployees] = useState({});
  // Function to handle employee selection for each station
  const handleEmployeeChange = (employee, stationId) => {
    setSelectedEmployees({ ...selectedEmployees, [stationId]: employee });
  };

  // select employee name and skill from employee code
  const [employeeCode, setEmployeeCode] = useState("");

  const employeeChange = async (event, stationId) => {
    const { value } = event.target;
    // setEmployeeCode(value); // Update the employee code state
    setEmployeeCode({ ...employeeCode, [stationId]: value });

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/operator/details";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("employee_id", value);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the selected employee details state
        setSelectedEmployees({ ...selectedEmployees, [stationId]: data });
      } else {
        console.error("Failed to fetch employee details");
        // Clear the selected employee details state if fetching fails
        setSelectedEmployees({ ...selectedEmployees, [stationId]: null });
      }
    } catch (error) {
      console.error("Error:", error);
      setSelectedEmployees({ ...selectedEmployees, [stationId]: null });
    }
  };

  return (
    <>
      <ToastContainer />
      <div>
        <DashBoardAbove />
      </div>

      <div className="task__main">
      
        <div className="previous_task">
          <div className="previous_task_date">
            <p>Select Date:</p>
            <DatePicker
              className="date_picker"
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div className="previous_task_date">
            <p>Select Time:</p>
            <input
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              //   step="1"
            />
          </div>
          <button className="task_qty_btn" onClick={getPartAndProcessInfo}>
            See Previous Logs
          </button>
        </div>
        <hr />

        <div className="task_buttons">
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

        <div className="task_qty_section">
          <div className="task__qty">
            <p>Select Shift Timings</p>

            <div className="update_dropdown">
              <select onChange={handleStartShiftChange}>
                <option>Start </option>
                {/* {generateTimeOptions()} */}
                {startTimeOptions}
              </select>
            </div>

            <div className="update_dropdown">
              <select onChange={handleEndShiftChange}>
                <option>End </option>
                {endTimeOptions}
              </select>
            </div>

            {/* <button className="task_qty_btn">Fetch From Quantity</button> */}
            <div>
              <button className="task_assign_btn" onClick={assignTask}>
                Assign Task
              </button>
            </div>
          </div>
        </div>

        <div>
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
                  <div className="task_stations_container">
                    {stations.map((station, index) => {
                    //   const partInfo = previousData[station]
                    //     ? previousData[station][3]
                    //     : "";
                   
                    const [operatorfname, operatorlname, empSkill, partInfo, processInfo, skillRequired, empId] = previousData[station] ?? ["", "", "", "", "", "", ""];

                      // Check if the current station is in the runningTasks array
                      const isRunning = runningTasks.includes(station);
                      const freeStationApirunningTask=runningTaskInitially.includes(station)

                      return (
                       <>
                       
                        <div key={station} className="task_stations">                      
                          <div className="task_stations_left">
                          <div>
                        {(isRunning || freeStationApirunningTask) && (
                          <u className="task-running">
                            Task is already running..
                          </u>
                        )}
                        </div>
                            <h4>{station}</h4>
                            <div className="task_stations_part">
                              <p>Part: {selectedParts[station] || partInfo}</p>
                            </div>
                            <div className="task_stations_part">
                              <p>
                                Process:{" "}
                                {selectedProcesses[station] || processInfo}
                              </p>
                              <p style={{ fontSize: "12px" }}>
                                Skill Required:&nbsp;
                                {selectedSkill[station] ? `${selectedSkill[station]} Or Above` : skillRequired? `${skillRequired} Or Above`: ""}
                              </p>
                            </div>

                            {selectedEmployees[station] ? (
                              <div className="task_stations_part">
                                <p className="employee-name">
                                  Employee:{" "}
                                  {selectedEmployees[station]["First Name"]}{" "}
                                  {selectedEmployees[station]["Last Name"]}
                                </p>
                                <p style={{ fontSize: "12px" }}>
                                  Skill:{" "}
                                  {selectedEmployees[station]["Skill Level"]}
                                </p>
                              </div>
                            ) : (
                              <div className="task_stations_part">
                                <p className="employee-name">
                                  Employee:{" "}
                                  {operatorfname + " " + operatorlname}{" "}
                                </p>
                                <p style={{ fontSize: "12px" }}>
                                  Skill :&nbsp;{empSkill}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="task_stations_right">
                            <input
                              className="task_station_input"
                              value={
                                // If the user has entered a value for the station, show it; otherwise, show the value from the API or default to 0
                                userEnteredValue[station]
                              }
                              placeholder="qty"
                              onChange={(e) => handleInputChange(e, station)}
                              disabled={isRunning || freeStationApirunningTask}
                            />
                            <div className="task_dropdown">
                              <select
                                onChange={(e) =>
                                  handlePartChange(e.target.value, station)
                                }
                                disabled={isRunning || freeStationApirunningTask}
                                
                              >
                                <option value="">Select</option>
                                {parts &&
                                  parts.map((data, idx) => (
                                    <option key={idx} value={data.part_no}>
                                      {data.part_no}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            <div className="task_dropdown">
                              <select
                                onChange={(e) =>
                                  handleProcessChange(e, station)
                                }
                              >
                                <option>Select</option>
                                {processes[station] &&
                                  processes[station].map((process, index) => (
                                    <option
                                      key={index}
                                      value={process.process_no}
                                    >
                                      {process.process_no}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            <div className="task_dropdown">
                              <input
                                className="task_station_input"
                                type="text"
                                placeholder="Id"
                                disabled={isRunning || freeStationApirunningTask}
                                value={
                                  employeeCode[station]
                                    ? employeeCode[station]
                                    : empId
                                }
                                onChange={(e) => employeeChange(e, station)}
                              />
                            </div>

                            {/* Show a message if part and process are selected but employee ID is missing */}
                            {
                              selectedProcesses[station] &&
                              !employeeCode[station] && (
                                <p style={{ color: "red", fontSize: "12px" }}>
                                  Employee ID is required
                                </p>
                              )}
                          </div>
                        </div>
                        </>
                      );
                    })}
                  </div>
                </div>
              )
            )}
        </div>
      </div>
    </>
  );
}

export default TaskNew;