import React, { startTransition, useEffect, useState } from "react";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { json, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import Line from "../Line/Line";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TaskPrac() {
  const [stationData, setStationData] = useState({});
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);
  const login = JSON.parse(localStorage.getItem("Login"));
  const [selectedLine, setSelectedLine] = useState(1);
  const [parts, setParts] = useState([]);
  const [processes, setProcesses] = useState({});
  // const [wholeProcess, setWholeProcess]=useState([])
  const [processName, setProcessName] = useState({});
  const [previousData, setPreviousData] = useState({});

  const [taskId, setTaskId] = useState("");
  const [error, setError] = useState("");

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

  // Generate options for start and end times
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  const updateOptions = () => {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const startOptions = generateTimeOptions(currentHour, currentMinute, 24);
    const endOptions = generateTimeOptions(currentHour, currentMinute, 48); // End time options for next 24 hours
    setStartTimeOptions(startOptions);
    setEndTimeOptions(endOptions);
  };

  useEffect(() => {
    updateOptions();
    const interval = setInterval(updateOptions, 60000); // Update every 60 seconds

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  function generateTimeOptions(currentHour, currentMinute, hours) {
    const options = [];

    // Start generating options from the current hour and minute
    let hour = currentHour;
    let minute = currentMinute;

    for (let i = 0; i < hours; i++) {
      const adjustedHour = hour % 24; // Ensure hour stays within 24-hour format

      // Format hour and minute as string with leading zeros
      const formattedHour = adjustedHour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");

      // Construct the time string (e.g., "HH:mm")
      const timeString = `${formattedHour}:${formattedMinute}:00`;

      // Push the option element with the time string as key and value
      options.push(<option key={timeString}>{timeString}</option>);

      // Increment minute by 30 (to represent each half-hour interval)
      minute += 30;
      // minute += 15;

      // If minute exceeds 59, increment hour and reset minute to 0
      if (minute >= 60) {
        hour++;
        minute %= 60;
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
          initializeArray(totalLines)
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

  console.log("object stationdaggta",stationData)
  

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

  const [wholePart, setWholePart] = useState("");

  const [selectedSkill, setSelectedSkill] = useState({});
  const [selectPrecedency, setSelectPrecedency] = useState({});

  const handleProcessChange = (e, stationId) => {
    const selectedProcessNo = e.target.value;
    const selectedProcess = processes[stationId].find(
      (process) => process.process_no == selectedProcessNo
    );

    setSelectedProcesses((prevProcesses) => ({
      ...prevProcesses,
      [stationId]: selectedProcessNo,
    }));
    if (selectedProcess) {
      setSelectedSkill((prevSkill) => ({
        ...prevSkill,
        [stationId]: selectedProcess.skill_level,
      }));
      setSelectPrecedency((prevPrec) => ({
        ...prevPrec,
        [stationId]: selectedProcess.process_precedency,
      }));
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
        console.log("object processName", processesData);
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


    // Function to convert the fetched data into a 2D array
    const convertTo2DArray = (data, innerSize) => {
        const result = [];
        for (let i = 0; i < data.length; i += innerSize) {
          result.push(data.slice(i, i + innerSize));
        }
        return result;
      };
    
  const getWholeProcesses = async (partNo,line) => {
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

      if (response) {
        const data = await response.json();

        if (response.ok) {
          // setProcessName(data.data);
          const processesData = data.data;
        //   setProcessName(processesData);
        // const innerSize = processesData.length; // Example size for inner arrays
        // const processes2DArray = convertTo2DArray(processesData, innerSize);
        // setProcessName(processes2DArray);
        const processesDataa = processesData.sort((a, b) => a.process_precedency - b.process_precedency);
        setProcessName((prevProcessName) => ({
            ...prevProcessName,
            [line]: processesDataa,
          }));
          console.log("object processDataa",processesDataa)
     
        } else {
          toast.info(data.Message);
        }
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  console.log("processName",processName)

  useEffect(() => {
    if (selectedPartNo) {
      getProcesses(selectedPartNo);
    }
  }, [selectedPartNo]);

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
        if (
          Object.keys(data.Datas).length === 0 &&
          data.running_task_on_stations.length === 0
        ) {
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

  const handleChange = (event) => {
    const { value } = event.target;
    setTaskId(value);

    // Validate if the input contains at least 4 digits
    if (!/^\d{4,}$/.test(value)) {
      setError("Please enter at least 4 digits");
    } else {
      setError("");
    }
  };

  const assignTask = async () => {
    // Check if shift timings are selected
    if (!startShiftTime || !endShiftTime) {
      toast.warning("Please select shift timings", { autoClose: 5000 });
      return; // Exit the function early
    }

    if (shift === "") {
      toast.warning("Please select Shift", { autoClose: 5000 });
      return;
    }

    if (taskId === "") {
      toast.warning("Please Enter Task Id", { autoClose: 5000 });
      return;
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

    const lineCode =
      selectedLine < 10 ? `L0${selectedLine}` : `L${selectedLine}`;

    // Get the selected line
    const selectedLineStations =
      stationData.stations[`${floor_no} ${lineCode}`];

    console.log("object selectedLineStations", selectedLineStations);

    // Check if selectedLineStations is defined and iterable
    if (!selectedLineStations || !Array.isArray(selectedLineStations)) {
      console.error("Selected line stations are undefined or not iterable");
      return;
    }

    selectedLineStations.forEach((station) => {
      if (runningTaskInitially.includes(station)) {
        console.log(
          `Skipping station ${station} as it already has a running task`
        );
        return;
      }

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
        selectedParts[station] ||
        (wholePart &&
          selectedProcesses[station] &&
          selectedEmployees[station] &&
          userEnteredValue[station]) ||
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
          shift: shift,
          station_precedency: selectPrecedency[station] || 0,
          start_shift_time: startShiftTime,
          end_shift_time: endShiftTime,
          temp_task_id: taskId,
          assigned_by_owner: login.employee_id,
          total_assigned_task: Number(userEnteredValue[station]) || 0,
        };

        // Push the new task object to the tasksArray
        console.log("adding newTask", newTask);
        tasksArray.push(newTask);
      }
    });

    console.log("object tasksArray", tasksArray);

    try {
      // Send a POST request to the server with the tasks data`
      const response = await fetch(fullLink, {
        method: "POST",
        body: JSON.stringify(tasksArray),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response) {
        if (response.ok) {
          {
            const data = await response.json();

            if (Object.keys(data["assigned task to"]).length > 0) {
              // Tasks were assigned successfully to specific stations
              const assignedStations = Object.keys(
                data["assigned task to"]
              ).join(", ");
              toast.success(
                `Task assigned successfully to stations: ${assignedStations}`
              );
            }

            if (Object.keys(data["operator_assigned_to_stations"]).length > 0) {
              // Operator(s) is already assigned to stations
              const operatorKeys = Object.keys(
                data["operator_assigned_to_stations"]
              );
              operatorKeys.forEach((operator) => {
                const stations =
                  data["operator_assigned_to_stations"][operator].join(", ");
                toast.info(
                  `Operator ${operator} already assigned on station ${stations}`,
                  { autoClose: 10000 }
                );
              });
            }

            if (
              Object.keys(data["assigned task to"]).length === 0 &&
              Object.keys(data["operator_assigned_to_stations"]).length === 0
            ) {
              // No tasks were assigned and no operator assigned to stations
              toast.info("Please free all the tasks First", {
                autoClose: 10000,
              });
            }

            // if (Object.keys(data["last_shift_on_these_stations"]).length > 0) {
            //   toast.info("Please select Another Shift", { autoClose: 10000 });
            // }

            // freeStation();
          }
        } else {
          const data = await response.json();
          const errorMessage = data.Message;
          toast.error(errorMessage);
          if (Object.keys(data["last_shift_on_these_stations"]).length > 0) {
            toast.info(
              "This Shift is already over. First Delete Task then select Another Shift",
              { autoClose: 20000 }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error on assigning Task:", error);
    }
  };

  const deleteTask = async (e) => {
    if (!taskId) {
      toast.error("First Enter Task ID");
      return;
    }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/delete_task";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("task_id", taskId);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response) {
        const data = await response.json();
        if (response.ok) {
          toast.success(`Task Deleted Successfully`);
        } else {
          toast.error(data.Message);
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const [userEnteredValue, setUserEnteredValue] = useState({});
  // Modify handleInputChange to update the entered value for the corresponding station

  const [globalInputValue, setGlobalInputValue] = useState([]);

  console.log("globalInputValue array",globalInputValue)


  const initializeArray = (size) => {
    const initialArray = Array(size).fill(null).map(() => ({
      part: '',
      inputValue: ''
    }));
    setGlobalInputValue(initialArray);
  };


  const updateElementAtIndex = (index, field, newValue) => {
    setGlobalInputValue(prev => {
      const newArray = [...prev];
      newArray[index] = {
        ...newArray[index],
        [field]: newValue
      };
      return newArray;
    });
  };

  const [runningTaskInitially, setRunningTaskInitially] = useState([]);
  useEffect(() => {
    freeStation();
  }, [stationData]);

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
        const data = await response.json();
        console.log("All stations freed successfully");
        setRunningTaskInitially(data.task_running_on_stations);
      } else {
        // Handle error response here
        console.error("Failed to free all stations");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //   particular employee details from employee code
  const [selectedEmployees, setSelectedEmployees] = useState({});
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

  const [shift, setShift] = useState("");

  //   const [selectedLine, setSelectedLine] = useState(null);
  const [userEnteredValues, setUserEnteredValues] = useState({});
  //   const [globalInputValue, setGlobalInputValue] = useState('');
  const [globalPart, setGlobalPart] = useState("");
  //   const [shift, setShift] = useState('');
  const [shiftTimings, setShiftTimings] = useState({});


  const handleShiftChangeForLine = (shiftType, value) => {
    setShiftTimings((prev) => ({
      ...prev,
      [selectedLine]: {
        ...prev[selectedLine],
        [shiftType]: value,
      },
    }));
  };

  const handleLineClick = (line) => {
    // G01 F02 L02
    const l = parseInt(line.split("L")[1]);
    console.log("l", l);
    setSelectedLine(l);
  };


  useEffect(() => {
    const newValues = { ...userEnteredValues };
    console.log("sttaions", stationData.stations);
    setUserEnteredValues(newValues);
  }, [selectedLine, globalInputValue]);

  const handleInputChange = (e, station) => {
    setUserEnteredValues({
      ...userEnteredValues,
      [station]: e.target.value,
    });
  };

  const handleGlobalInputChange = (e,field,selectedLine) => {
    const input = e.target.value;
    console.log("input",input)
    console.log("input selected line",selectedLine)
    updateElementAtIndex(selectedLine,field,input)
  };

//   const handleWholePartChange = (value,field, selectedLine) => {
//     setGlobalPart(value); 
//     getWholeProcesses(value, selectedLine);   
//     updateElementAtIndex(selectedLine,field,value)
//   };

const handleWholePartChange = async (value, field, selectedLine) => {
    setSelectedParts((prevSelectedParts) => ({
      ...prevSelectedParts,
      [selectedLine]: value,
    }));
    // await getWholeProcesses(value, selectedLine);
    if (!value) {
        // If part is empty, clear the processes for this line
        setProcessName((prevProcessName) => ({
          ...prevProcessName,
          [selectedLine]: [],
        }));
      } else {
        await getWholeProcesses(value, selectedLine);
      }

    updateElementAtIndex(selectedLine, field, value);
  };


  function extractValue(str) {
    const regex = /L(\d+)/;
    const match = str.match(regex);
    if (match && match[1]) {
        return parseInt(match[1]);
    }
    return null; 
}

const extractStation = (identifier) => {
    const regex = /S(\d+)/;
    const match = identifier.match(regex);

    if (match && match[1]) {
        return parseInt(match[1]);
      }
      return null;
  };

  return (
    <>
      <div style={{ marginLeft: "15rem" }}>
        <div className="task_buttons">
          {stationData.lines &&
            stationData.lines
              .sort((a, b) => {
                const lineA = parseInt(a.split("L")[1]);
                const lineB = parseInt(b.split("L")[1]);
                return lineA - lineB;
              })
              .map((line, index) => (
                <button key={index} onClick={() => handleLineClick(line)}>
                  {`Line ${parseInt(line.split("L")[1])}`}
                </button>
              ))}
        </div>

        {selectedLine && (
          <>
            <div className="task_qty_section">
              <div className="task__qty">
                <p>Select Shift</p>
                <div className="update_dropdown">
                  <select onChange={(e) => setShift(e.target.value)}>
                    <option value="">Shift</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>

                <p>Select Shift Timings</p>

                <div className="update_dropdown">
                  <select
                    onChange={(e) =>
                      handleShiftChangeForLine("start", e.target.value)
                    }
                  >
                    <option>Start </option>
                    {startTimeOptions}
                  </select>
                </div>

                <div className="update_dropdown">
                  <select
                    onChange={(e) =>
                      handleShiftChangeForLine("end", e.target.value)
                    }
                  >
                    <option>End </option>
                    {endTimeOptions}
                  </select>
                </div>

                <div>
                  <input
                    className="task_id"
                    placeholder="TaskId"
                    pattern="[0-9]{4}"
                    title="Please enter exactly 4 numeric characters"
                    minLength={4}
                    value={taskId}
                    onChange={handleChange}
                  />
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </div>

                <div className="task_btnss">
                  <div>
                    <button className="task_assign_btn" onClick={deleteTask}>
                      Delete Task
                    </button>
                  </div>
                  <div>
                    <button className="task_assign_btn" onClick={assignTask}>
                      Assign Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}


        <div className="update_dropdown">
          <div className="task_whole_qty">
            <p>Select Part:</p>
            <select 
            value={globalInputValue[selectedLine]?.part || ''}
            onChange={(e) => handleWholePartChange(e.target.value,'part', selectedLine)}>
              <option value="">Select</option>
              {parts &&
                parts.map((data, idx) => (
                  <option key={idx} value={data.part_no}>
                    {data.part_no}
                  </option>
                ))}
            </select>

            <input
              className="global_input"
              value={globalInputValue[selectedLine]?.inputValue || ''}
              placeholder="Enter global qty"
              onChange={
                (e)=>handleGlobalInputChange(e,'inputValue',selectedLine)
            }
            />
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
                      let valueForLine = "";
                        const line=extractValue(station)
                        const st=extractStation(station)
                        console.log("line stationlist ",line, selectedLine, st,processName)
                    
                      return (
                        <div key={station} className="task_stations">
                          <div className="task_stations_left">{station}
                          <div className="task_stations_part">
                                <p>
                                  Part: {globalInputValue[selectedLine]?.part || ''}
                                </p>
                                <p>
                                  Process:{processName[selectedLine]?.[st-1]?.process_no || ''}
                                  {/* {processName[st]?.process_no || ''} */}
                                  </p>
                              </div>
                              </div>
                          <div className="task_stations_right">
                          <input
                                className="task_station_input"
                                value={processName[selectedLine]?.[st-1]?.process_precedency || 0}                                                            
                              />
                            <input
                              className="task_station_input"
                              value={globalInputValue[selectedLine]?.inputValue || ''}
                              placeholder="qty"
                              onChange={(e) =>                                 
                                handleInputChange(e, station)                            
                            }
                            />
                          </div>
                        </div>
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


export default TaskPrac;