import React, { startTransition, useEffect, useState } from "react";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { json, useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import Line from "../Line/Line";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "../Modal/Modal";
import TaskDetailsModal from "../TaskDetailsModal/TaskDetailsModal";



export default function TaskPrac() {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");


  const handleShowModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage("");
  };


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
  const [processName, setProcessName] = useState([]);
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

  const [timingDiff, setTimingDiff] = useState(0);

  const [wholePart, setWholePart] = useState("");
  const [wholeQty, setWholeQty] = useState("");
  const [selectedSkill, setSelectedSkill] = useState({});
  const [lineStations, setLineStations] = useState([]);
  const [userEnteredValue, setUserEnteredValue] = useState({});
  const [showPopUpProcess, setSHowPopUpProcess] = useState(false);
  const [apiValue, setApiValue] = useState({});
  const [globalInputValue, setGlobalInputValue] = useState([]);
  const [globalPart, setGlobalPart] = useState("");
  const [runningTaskInitially, setRunningTaskInitially] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  //   particular employee details from employee code
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [employeeCode, setEmployeeCode] = useState("");
  const [shift, setShift] = useState("");
  //   setting employee automatically
  const [employeeResponse, setEmployeeResponse] = useState({});
  const [employeeDataString, setEmployeeDataString] = useState([]);

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

    // Round up to the next 15-minute interval
    const roundedMinute = Math.ceil(currentMinute / 15) * 15;
    let hour = currentHour;
    let minute = roundedMinute;

    if (minute >= 60) {
      hour++;
      minute = 0;
    }

    for (let i = 0; i < hours * 4; i++) {
      // 4 intervals per hour
      const adjustedHour = hour % 24; // Ensure hour stays within 24-hour format
      const dayOffset = Math.floor(hour / 24); // Calculate day offset

      // Format hour and minute as string with leading zeros
      const formattedHour = adjustedHour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");

      // Construct the time string (e.g., "HH:mm")
      const timeString = `${formattedHour}:${formattedMinute}:00`;

      // Construct a unique key by combining the dayOffset and timeString
      const uniqueKey = `${dayOffset}-${timeString}`;

      // Push the option element with the unique key and time string as value
      options.push(
        <option key={uniqueKey} value={timeString}>
          {timeString}
        </option>
      );

      // Increment minute by 15 (to represent each 15-minute interval)
      minute += 15;

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
          initializeArray(totalLines + 1);
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
      //   setSelectPrecedency((prevPrec) => ({
      //     ...prevPrec,
      //     [stationId]: selectedProcess.process_precedency,
      //   }));
      // }
      console.log("selectedProcesses", selectedProcesses);
    }
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

  const getWholeProcesses = async (partNo, line) => {
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
          // const processesDataa = processesData.sort(
          //   (a, b) => a.process_precedency - b.process_precedency
          // );
          setProcessName((prevProcessName) => ({
            ...prevProcessName,
            [line]: processesData,
          }));
        } else {
          handleShowModal(data.Message);
        }
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // useEffect(() => {
  //   if (selectedPartNo) {
  //     getProcesses(selectedPartNo);
  //   }
  // }, [selectedPartNo]);

  useEffect(() => {
    if (stationData.lines && stationData.lines.length > 0) {
      handleLineClick(stationData.lines[0]);
    }
  }, [stationData]);

  const [activeBtn, setActiveBtn] = useState("");

  const handleLineClick = async (line) => {
    // line=G01 F02 L01
    setActiveBtn(line);
    console.log("object initially selcted line", line);
    const data = parseInt(line.split("L")[1]);
    setSelectedLine(data);
    // Parse the stations data from the state
    const allStations = stationData.stations;
    // Find stations corresponding to the selected line
    const stationsForSelectedLine = allStations[line] || [];
    setLineStations(stationsForSelectedLine);
    console.log("stationsForSelectedLine", stationsForSelectedLine);
  };

  // Function to handle change in start shift time
  const handleStartShiftChange = (e) => {
    console.log("sshift tim", e.target.value, startTimeOptions);
    setStartShiftTime(e.target.value);
  };

  // Function to handle change in end shift time
  const handleEndShiftChange = (e) => {
    setEndShiftTime(e.target.value);
  };

  // get previous data on selected date and time
  const getPartAndProcessInfo = async () => {
    // Check if the selected time is empty
    if (selectedTime.trim() === "00:00") {
      alert("Please select Time");
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
          handleShowModal("Nothing assigned on that day and time");
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


  const [taskArray, setTaskArray] = useState([]);
const [showTaskModal, setShowTaskModal] = useState(false);
//   const assignTask = async () => {  

//     try{

//     // Check if shift timings are selected
//     if (!startShiftTime || !endShiftTime) {
//       alert("Please select shift timings", { autoClose: 5000 });
//       return; // Exit the function early
//     }

//     if (shift === "") {
//       alert("Please select Shift", { autoClose: 5000 });
//       return;
//     }

//     if (taskId === "") {
//       alert("Please Enter Task Id", { autoClose: 5000 });
//       return;
//     }

//     // if(userEnteredValue==""){
//     //     toast.warning("Please Enter Quantity timings", { autoClose: 5000 });
//     //     return;
//     // }

//     const link = process.env.REACT_APP_BASE_URL;
//     const endPoint = "/floorincharge/assign_task";
//     const fullLink = link + endPoint;

//     // Initialize an empty array to store task objects
//     const tasksArray = [];

//     const lineCode =
//       selectedLine < 10 ? `L0${selectedLine}` : `L${selectedLine}`;

//     // Get the selected line
//     const selectedLineStations =
//       stationData.stations[`${floor_no} ${lineCode}`];

//     console.log(
//       "object selectedLineStations on assigntask func",
//       selectedLineStations
//     );
//     // ['G01 F02 L01 S01', 'G01 F02 L01 S03', 'G01 F02 L01 S04', 'G01 F02 L01 S05', 'G01 F02 L01 S06', 'G01 F02 L01 S07']

//     // Check if selectedLineStations is defined and iterable
//     if (!selectedLineStations || !Array.isArray(selectedLineStations)) {
//       console.error("Selected line stations are undefined or not iterable");
//       return;
//     }

//     selectedLineStations.forEach((station, index) => {
//       if (runningTaskInitially.includes(station)) {
//         console.log(
//           `Skipping station ${station} as it already has a running task`
//         );
//         return;
//       }

      
//       if(userEnteredValue[station]==""){
//         alert(`Please Enter Quantity  for ${station}`);
        
//     }


//       //   console.log(processName?.[selectedLine]?.[index ]?.Cycle_Time_secs ? (timingDiff/processName?.[selectedLine]?.[index]?.Cycle_Time_secs):'')

//       // if (previousData.hasOwnProperty(station)) {
//       // Extract required data from previousData for the current station
//       const [
//         firstName,
//         lastName,
//         skillLevel,
//         part,
//         process,
//         skillRequired,
//         employeeid,
//       ] = previousData[station] || [];

//       // Check if the user has entered values for part, process, and employee ID for the current station
//       if (
//         ((selectedParts[station] || globalInputValue[selectedLine]?.part) &&
//           (selectedProcesses[station] ||
//             processName[selectedLine]?.[index]?.process_no) &&
//           (selectedEmployees[station] ||
//             employeeResponse?.[station]?.[shift][0]) &&
//           (userEnteredValue[station] ||
//             (processName?.[selectedLine]?.[index].Cycle_Time_secs
//               ? timingDiff /
//                 processName?.[selectedLine]?.[index].Cycle_Time_secs
//               : ""))) ||
//         (part && process && employeeid)
//       ) {
//         // Create a new task object for the station
//         const newTask = {
//           station_id: station,
//           // employee_id: employeeCode[station] || employeeid ? employeeid:"", // Use user entered value if available, otherwise use value from previousData
//           // part_no: selectedParts[station] || part?  part:"", // Use user entered value if available, otherwise use value from previousData
//           // process_no: selectedProcesses[station] ||process?process:"" , // Use user entered value if available, otherwise use value from previousData
//           employee_id:
//             (selectedEmployees[station] ? employeeCode[station] : employeeid) ||
//             (selectedEmployee[station]
//               ? selectedEmployee[station]
//               : employeeResponse?.[station]?.[shift][0]) ||
//             "", // Use user entered value if available, otherwise use value from previousData
//           part_no:
//             selectedParts[station] ||
//             part ||
//             "" ||
//             globalInputValue[selectedLine]?.part, // Use user entered value if available, otherwise use value from previousData
//           process_no:
//             selectedProcesses[station] ||
//             process ||
//             processName[selectedLine]?.[index]?.process_no ||
//             "",
//           shift: shift,
//           station_precedency: index + 1,
//           start_shift_time: startShiftTime,
//           end_shift_time: endShiftTime,
//           temp_task_id: taskId,
//           assigned_by_owner: login.employee_id,
//           total_assigned_task:
//             Number(userEnteredValue[station]) ||
//             (processName?.[selectedLine]?.[index].Cycle_Time_secs
//               ? Math.floor(
//                   timingDiff / processName[selectedLine][index].Cycle_Time_secs
//                 )
//               : "") ||
//             0,
//         };

//         // Push the new task object to the tasksArray
//         console.log("adding newTask", newTask);
//         tasksArray.push(newTask);
//       }
//     });

//  // Check if the tasksArray is empty before making the API call
//  if (tasksArray.length === 0) {
//   alert("Please fill all the details.");
//   return;
// }

// setTaskArray(tasksArray);
// setShowTaskModal(true);

//     console.log("object tasksArray", tasksArray);

//     try {
//       // Send a POST request to the server with the tasks data`
//       const response = await fetch(fullLink, {
//         method: "POST",
//         body: JSON.stringify(tasksArray),
//         headers: {
//           "Content-type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response) {
//         if (response.ok) {
//           {
//             const data = await response.json();

//             if (Object.keys(data["assigned task to"]).length > 0) {
//               // Tasks were assigned successfully to specific stations
//               const assignedStations = Object.keys(
//                 data["assigned task to"]
//               ).join(", ");
//               handleShowModal(
//                 `Task assigned successfully to stations: ${assignedStations}`
//               );
//             }

//             if (Object.keys(data["operator_assigned_to_stations"]).length > 0) {
//               // Operator(s) is already assigned to stations
//               const operatorKeys = Object.keys(
//                 data["operator_assigned_to_stations"]
//               );
//               operatorKeys.forEach((operator) => {
//                 const stations =
//                   data["operator_assigned_to_stations"][operator].join(", ");
//                   handleShowModal(
//                   `Operator ${operator} already assigned on station ${stations}`,
//                   { autoClose: 10000 }
//                 );
//               });
//             }

//             if (
//               Object.keys(data["assigned task to"]).length === 0 &&
//               Object.keys(data["operator_assigned_to_stations"]).length === 0
//             ) {
//               // No tasks were assigned and no operator assigned to stations
//               handleShowModal("Please free all the tasks First", {
//                 autoClose: 10000,
//               });
//             }

//             // if (Object.keys(data["last_shift_on_these_stations"]).length > 0) {
//             //   toast.info("Please select Another Shift", { autoClose: 10000 });
//             // }

//             freeStation();
//           }
//         } else {
//           const data = await response.json();
//           const errorMessage = data.Message;
//           alert(errorMessage);
//           if (Object.keys(data["last_shift_on_these_stations"]).length > 0) {
//             handleShowModal(
//               "This Shift is already over. First Delete Task then select Another Shift",
//               { autoClose: 20000 }
//             );
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error on assigning Task:", error);
//     }
//   }catch(error){
//     console.error("Error on assigning Task:", error);
//   }
//   };

const assignTask = async () => {
  try {
    // Check if shift timings are selected
    if (!startShiftTime || !endShiftTime) {
      alert("Please select shift timings");
      return;
    }

    if (shift === "") {
      alert("Please select Shift");
      return;
    }

    if (taskId === "") {
      alert("Please Enter Task Id");
      return;
    }

    const tasksArray = [];
    const lineCode = selectedLine < 10 ? `L0${selectedLine}` : `L${selectedLine}`;
    const selectedLineStations = stationData.stations[`${floor_no} ${lineCode}`];

    if (!selectedLineStations || !Array.isArray(selectedLineStations)) {
      console.error("Selected line stations are undefined or not iterable");
      return;
    }

    selectedLineStations.forEach((station, index) => {
      if (runningTaskInitially.includes(station)) {
        console.log(`Skipping station ${station} as it already has a running task`);
        return;
      }

      if (userEnteredValue[station] === "") {
        alert(`Please Enter Quantity for ${station}`);
        return;
      }

      const [
        firstName,
        lastName,
        skillLevel,
        part,
        process,
        skillRequired,
        employeeid,
      ] = previousData[station] || [];

      if (
        ((selectedParts[station] || globalInputValue[selectedLine]?.part) &&
          (selectedProcesses[station] || processName[selectedLine]?.[index]?.process_no) &&
          (selectedEmployees[station] || employeeResponse?.[station]?.[shift][0]) &&
          (userEnteredValue[station] ||
            (processName?.[selectedLine]?.[index].Cycle_Time_secs
              ? timingDiff / processName?.[selectedLine]?.[index].Cycle_Time_secs
              : ""))) ||
        (part && process && employeeid)
      ) {
        const newTask = {
          station_id: station,
          employee_id:
            (selectedEmployees[station] ? employeeCode[station] : employeeid) ||
            (selectedEmployee[station]
              ? selectedEmployee[station]
              : employeeResponse?.[station]?.[shift][0]) ||
            "",
          part_no:
            selectedParts[station] ||
            part ||
            "" ||
            globalInputValue[selectedLine]?.part,
          process_no:
            selectedProcesses[station] ||
            process ||
            processName[selectedLine]?.[index]?.process_no ||
            "",
          shift: shift,
          station_precedency: index + 1,
          start_shift_time: startShiftTime,
          end_shift_time: endShiftTime,
          temp_task_id: taskId,
          assigned_by_owner: login.employee_id,
          total_assigned_task:
            Number(userEnteredValue[station]) ||
            (processName?.[selectedLine]?.[index].Cycle_Time_secs
              ? Math.floor(
                  timingDiff / processName[selectedLine][index].Cycle_Time_secs
                )
              : "") ||0
        };

        console.log("adding newTask", newTask);
        tasksArray.push(newTask);
      }
    });

    // if (tasksArray.length === 0) {
    //   alert("Please fill all the details.");
    //   return;
    // }

    setTaskArray(tasksArray);
    setShowTaskModal(true);

  } catch (error) {
    console.error("Error on assigning Task:", error);
  }
};

const handleAssign = async () => {
   // Get current time
   const currentTime = new Date();

   // Parse the endShiftTime (e.g., "12:00:00") and set it to today's date
   const [hours, minutes, seconds] = endShiftTime.split(':');
   const shiftEndTime = new Date();
   shiftEndTime.setHours(hours, minutes, seconds, 0);
 
   // Compare current time with endShiftTime
   if (currentTime >= shiftEndTime) {
     handleShowModal("Cannot assign tasks as Shift EndTime has already ended.", { autoClose: 10000 });
     return; // Stop execution if the current time is after the shift end time
   }

  
  const link = process.env.REACT_APP_BASE_URL;
  const endPoint = "/floorincharge/assign_task";
  const fullLink = link + endPoint;

  try {
    const response = await fetch(fullLink, {
      method: "POST",
      body: JSON.stringify(taskArray),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response) {
      if(response.ok){
      const data = await response.json();

      if (Object.keys(data["assigned task to"]).length > 0) {
        const assignedStations = Object.keys(data["assigned task to"]).join(", ");
        handleShowModal(`Task assigned successfully to stations: ${assignedStations}`);
      }

      if (Object.keys(data["operator_assigned_to_stations"]).length > 0) {
        const operatorKeys = Object.keys(data["operator_assigned_to_stations"]);
        operatorKeys.forEach((operator) => {
          const stations = data["operator_assigned_to_stations"][operator].join(", ");
          handleShowModal(`Operator ${operator} already assigned on station ${stations}`, { autoClose: 10000 });
        });
      }

      if (Object.keys(data["assigned task to"]).length === 0 &&
          Object.keys(data["operator_assigned_to_stations"]).length === 0) {
        handleShowModal("Please free all the tasks First", { autoClose: 10000 });
      }
      freeStation();
    } 
  else{
      const data = await response.json();
      if (data && data.Message) {
        const errorMessage = data.Message;
        alert(errorMessage);
      } 
    
      if (Object.keys(data["last_shift_on_these_stations"]).length > 0) {
        handleShowModal("This Shift is already over. First Delete Task then select Another Shift", { autoClose: 20000 });
      }
    }
  }
  } catch (error) {
    alert("Error on assigning Task:", error);
  }

  setShowTaskModal(false);
};


  const deleteTask = async (e) => {
    if (!taskId) {
      alert("First Enter Task ID");
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
          handleShowModal(`Task Deleted Successfully`);
          freeStation()
        } else {
          alert(data.Message);
        }
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  // Modify handleInputChange to update the entered value for the corresponding station
  const handleInputChange = (e, stationId) => {
    const { value } = e.target;

    // const station=extractStation(stationId)
    // const limit = Math.floor(timingDiff / (processName?.[selectedLine]?.[station - 1]?.Cycle_Time_secs || 1));

    // Check if the entered value exceeds the calculated limit
    // if (value > limit) {
    //   setSHowPopUpProcess(true); // Show popup or alert
    //   return; // Exit function to prevent setting invalid value
    // }
    const s = extractStation(stationId);
    const apiCycleTime =
      processName && processName?.[selectedLine]?.[s - 1]?.Cycle_Time_secs;
    if (apiCycleTime) {
      // setApiValue(Math.floor(timingDiff / apiCycleTime));
      // Compare the entered value with the API value
      if (parseInt(value) > Math.floor(timingDiff / apiCycleTime)) {
        alert(`Limit exceeded for ${stationId}`, { autoClose: 1000 });        
      }
    }

    // // Update the state with the entered value for the station
    setUserEnteredValue((prevState) => ({
      ...prevState,
      [stationId]: value,
    }));
  };

  const initializeArray = (size) => {
    const initialArray = Array(size)
      .fill(null)
      .map(() => ({
        part: "",
        inputValue: "",
      }));
    setGlobalInputValue(initialArray);
  };

  const updateElementAtIndex = (index, field, newValue) => {
    setGlobalInputValue((prev) => {
      const newArray = [...prev];
      newArray[index] = {
        ...newArray[index],
        [field]: newValue,
      };
      return newArray;
    });
  };

  const handleGlobalInputChange = (e, field, selectedLine) => {
    const input = e.target.value;
    console.log("input", input);
    console.log("input selected line", selectedLine);
    updateElementAtIndex(selectedLine, field, input);
  };

  const [selectedWholePart, setSelectedWholePart] = useState({});
  const handleWholePartChange = async (value, field, selectedLine) => {
    if (value == undefined) {
      // Handle undefined case appropriately
      return;
    }

    setSelectedWholePart((prevSelectedParts) => ({
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

  useEffect(() => {
    freeStation();
  }, [stationData]);

  const freeStation = async () => {
    try{
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
        setRunningTaskInitially(data.task_running_on_stations);
      } else {
        // Handle error response here
        console.error("Failed to free all stations");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }catch(error){
    console.error(error)
  }
  };

  const handleEmployeeCodeChange = (event) => {
    setEmployeeCode(event.target.value);
  };

  // Function to handle employee selection for each station
  //   const handleEmployeeChange = (employee, stationId) => {
  //     setSelectedEmployees({ ...selectedEmployees, [stationId]: employee });
  //   };

  const handleEmployeeChange = (station, value) => {
    setSelectedEmployees((prev) => ({
      ...prev,
      [station]: value,
    }));
  };

  // select employee name and skill from employee code
  const employeeChange = async (e, stationId) => {
    // const { value } = event.target;
    const value = e.target ? e.target.value.toUpperCase() : e;
    // Clear the selected employee details for the current stationId
    setSelectedEmployees((prevSelectedEmployees) => ({
      ...prevSelectedEmployees,
      [stationId]: null, // or {} depending on how you handle empty state
    }));
    console.log(`Employee changed for station ${stationId}: ${value}`);
    // setEmployeeCode(value); // Update the employee code state
    setEmployeeCode({ ...employeeCode, [stationId]: value });

    console.log(`PRINTED VALUES IN ONCHANGE`, employeeCode, {
      [stationId]: value,
    });

    // setSelectedEmployees(prevState => ({
    //     ...prevState,
    //     [stationId]: value
    // }));

    if(value.length<3){
      return;
    }
    
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
        // setSelectedEmployees({ ...selectedEmployees, [stationId]: null });
      }
    } catch (error) {
      console.error("Error:", error);
      //   setSelectedEmployees({ ...selectedEmployees, [stationId]: null });
    }
  };

  const assignEmployee = async () => {
    if (shift === "") {
      alert("Please Select Shift", { autoClose: 3000 });
      return;
    }

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/operator_of_station_shift";
    const fullLink = link + endPoint;

    try {
      const stations = lineStations;
      const payload = stations.map((station) => ({
        station_id: station,
        shift: shift,
      }));

      const response = await fetch(fullLink, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response) {
        const data = await response.json();

        if (response.ok) {
          // Replace single quotes with double quotes
          const fixedDataString = data.Data.replace(/'/g, '"');
          const employeeDetails = data.Employees_data.replace(/'/g, '"');
          //   const fixedDataString = data.Data;

          console.log("object fixedDataString", fixedDataString);
          // Replace double quotes with single quotes
          // const fixedDataString = JSON.stringify(data.Data).replace(/"/g, "'");

          // Parse the 'Data' property
          let parsedData;
          let employeeInfo;
          try {
            // parsedData = fixedDataString;
            parsedData = JSON.parse(fixedDataString);
            employeeInfo = JSON.parse(employeeDetails);
          } catch (error) {
            console.error("Error parsing employee data:", error);
            return; // Exit the function early if parsing fails
          }

          // Check if it's an empty object
          if (Object.keys(parsedData).length === 0) {
          handleShowModal("No Employee Assigned on this shift", {
              autoClose: 2000,
            });
            return;
          } else {
            setEmployeeResponse(parsedData);
            setEmployeeDataString(employeeInfo);
          }
        } else {
          handleShowModal(data.Message);
        }
      } else {
        console.error("Failed to assign employee", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // let station
  //////////////////////////////////////////////////////////////////////////////////for skills//////////////////////
  //   const getEmployeeNameAndSkill = () => {
  //     if (employeeResponse && employeeResponse[station] && employeeResponse[station][shift]) {
  //       const employeeCode = employeeResponse[station][shift][0];
  //       if (employeeCode && employeeDataString[employeeCode]) {
  //         const employeeInfo = employeeDataString[employeeCode].split(',');
  //         // const name = employeeInfo[0].trim();
  //         const skill = employeeInfo[1] ? employeeInfo[1].trim() : '';
  //         return {skill};
  //       }
  //     }
  //     return {skill:''};
  //   };

  //   const {skill} = getEmployeeNameAndSkill();
  // //////////////////////////////////////////////////////////////////////////////////////////////

  console.log("object employeeResponse", employeeResponse);
  const fetchQty = async () => {
    // Check if shift timings are selected
    if (!startShiftTime || !endShiftTime) {
      alert("Please select shift Timings", { autoClose: 3000 });
      return; // Exit the function early
    }

    // Check if a part is selected for the current selectedLine
    if (!globalInputValue[selectedLine]?.part) {
      alert("Please Select Part", { autoClose: 3000 });
      return;
    }

    // Extract hours and minutes from the start and end shift times
    const [startHours, startMinutes] = startShiftTime.split(":").map(Number);
    const [endHours, endMinutes] = endShiftTime.split(":").map(Number);

    // Convert start and end times to total seconds
    const startInSeconds = startHours * 3600 + startMinutes * 60;
    const endInSeconds = endHours * 3600 + endMinutes * 60;

    // Calculate the difference in seconds
    const diffInSeconds = endInSeconds - startInSeconds;

    // Handle potential negative difference (if end time is before start time)
    const adjustedDiffInSeconds =
      diffInSeconds < 0 ? 24 * 3600 + diffInSeconds : diffInSeconds;

    // Log or use the calculated difference in seconds
    console.log("Time difference in seconds:", adjustedDiffInSeconds);
    setTimingDiff(adjustedDiffInSeconds);
  };

  const shiftTimings = {
    A: { start: "07:00:00", end: "12:00:00" },
    B: { start: "13:00:00", end: "17:00:00" },
    C: { start: "17:00:00", end: "22:00:00" },
  };

  const setShifts = (shift) => {
    setShift(shift);
    if (shiftTimings[shift]) {
      setStartShiftTime(shiftTimings[shift].start);
      setEndShiftTime(shiftTimings[shift].end);
    } else {
      setStartShiftTime("");
      setEndShiftTime("");
    }
  };

  // const [showStation, setShowStation] = useState({});
  // Handle checkbox change for showing stations
  // const handleCheckboxChange = (index, checked, station) => {
  //   setShowStation(prevState => ({
  //     ...prevState,
  //     [station]: { checked: !showStation[station]?.checked  }
  //   }));
  // };

  //  const handleCheckboxChange = (station) => {
  //   setShowStation(prevState => ({
  //     ...prevState,
  //     [station]: !prevState[station]
  //   }));
  // };


  return (
    <>

<TaskDetailsModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        taskArray={taskArray}
        handleAssign={handleAssign}
      />
     
      <div>
        <DashBoardAbove />
      </div>

      <div>
      {showModal && <Modal message={modalMessage} onClose={handleCloseModal} />}
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
                <button
                  className={`${activeBtn == line ? "act" : ""}`}
                  key={index}
                  onClick={() => handleLineClick(line)}
                >
                  {`Line ${parseInt(line.split("L")[1])}`}
                </button>
              ))}
        </div>

        <div className="task_qty_section">
          <div className="task__qty">
            <p>Select Shift</p>
            <div className="update_dropdown">
              <select onChange={(e) => setShifts(e.target.value)}>
                <option value="">Shift</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <p>Select Shift Timings</p>

            <div className="update_dropdown">
              <select onChange={handleStartShiftChange} value={startShiftTime}>
                <option>Start</option>
                {startTimeOptions}
              </select>
            </div>
            <div className="update_dropdown">
              <select onChange={handleEndShiftChange} value={endShiftTime}>
                <option>End</option>
                {endTimeOptions}
              </select>
            </div>

            <div>
              <input
                className="task_id"
                placeholder="TaskId"
                pattern="[0-9]{4}" // This pattern allows only 4 numeric characters
                title="Please enter exactly 4 numeric characters"
                minLength={4}
                value={taskId}
                onChange={handleChange}
              />
              {error && <p style={{ color: "red" }}>{error}</p>}
            </div>

            {/* <button className="task_qty_btn">Fetch From Quantity</button> */}
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

        {/* <div className="update_dropdown">
          <div className="global_task">
            <div className="task_whole_part">
              <p>Select Part:</p>
              <select
                value={globalInputValue[selectedLine]?.part || ""}
                onChange={(e) =>
                  handleWholePartChange(e.target.value, "part", selectedLine)
                }
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

            <div className="global_task_qty">
              <div>
                <button className="task_assign_btn" onClick={assignEmployee}>
                  Assign Employee
                </button>
              </div>
              <div>
                <button className="task_assign_btn" onClick={fetchQty}>
                  Fetch From Quantity
                </button>
              </div>
            </div>
          </div>
        </div> */}

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
                      const [
                        operatorfname,
                        operatorlname,
                        empSkill,
                        partInfo,
                        processInfo,
                        skillRequired,
                        empId,
                      ] = previousData[station] ?? ["", "", "", "", "", "", ""];

                      // Check if the current station is in the runningTasks array
                      const runningOnLogs = runningTasks.some(
                        (task) => task[0] === station
                      );
                      const freeStationApirunningTask =
                        runningTaskInitially.includes(station);

                      const isRunning = runningTaskInitially.some(
                        (task) => task[0] === station
                      );

                      let stationId,
                        employeeId,
                        firstName,
                        lastName,
                        runempSkill,
                        empprocessInfo,
                        runpartName,
                        runprocessSkill,
                        taskId;
                      if (isRunning || runningOnLogs) {
                        // Extract details from the running task
                        const runningTask =
                          runningTaskInitially.find(
                            (task) => task[0] === station
                          ) || runningTasks.find((task) => task[0] === station);

                        [
                          stationId,
                          employeeId,
                          firstName,
                          lastName,
                          runempSkill,
                          empprocessInfo,
                          runpartName,
                          runprocessSkill,
                          taskId
                        ] = runningTask;
                      }

                      const s = extractStation(station);
                      const l = extractValue(station);
                      console.log(
                        "extracted line and station",
                        s,
                        l,
                        station,
                        selectedLine
                      );
                      console.log("processName", processName);

                      return (
                        <>
                          <div key={station} className="task_stations">
                            <div className="task_stations_left">
                              <div>
                                {(isRunning || runningOnLogs) && (
<div style={{display:'flex'}}>
                                  <u className="task-running">
                                    Task is running..
                                  </u>
                                  <p style={{color:'green',fontWeight:'bold'}}>({taskId})</p>
                                  </div>
                                )}
                              </div>
                              
                              <h4>
                                {/* <span style={{marginRight:'10px'}}>
                                  <label>
                                    <input
                                      type="checkbox"
                                      className="input_checkbox"
                                      checked={showStation[station]}
                                      onChange={(e) => handleCheckboxChange( station)}
                                      
                                    />
                                  </label>
                                </span> */}
                                {station}
                              </h4>

                              <div className="task_stations_part">
                                <p>
                                  Part:{" "}{isRunning || runningOnLogs ? runpartName:''||
                                  selectedParts[station] ||
                                    partInfo ||
                                    globalInputValue[selectedLine]?.part ||
                                    ""}
                                </p>
                              </div>

                              <div className="task_stations_part">
                                <p>
                                  Process:{" "}
                                  {isRunning || runningOnLogs
                                    ? empprocessInfo
                                    : selectedProcesses[station] ||processInfo||
                                      // processInfo ||
                                      // processName[selectedLine]?.[s - 1]
                                      //   ?.process_no ||
                                      // ""
                                      (globalInputValue[selectedLine]?.part
                                        ? processName[selectedLine]?.[s - 1]
                                            ?.process_no
                                        : "")}
                                </p>
                                <p style={{ fontSize: "12px" }}>
                                  Skill Required:&nbsp;
                                  {isRunning || runningOnLogs
                                    ? runprocessSkill 
                                    : selectedSkill[station]
                                    ? `${selectedSkill[station]} Or Above`
                                    : skillRequired
                                    ? `${skillRequired} Or Above` 
                                    : "" || 
                                      (globalInputValue[selectedLine]?.part
                                        ? processName[selectedLine]?.[s - 1]
                                            ?.skill_level
                                        : "") ||skillRequired}
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
                                    {(isRunning || runningOnLogs
                                      ? (firstName+" "+lastName)
                                      : operatorfname && operatorlname
                                      ? `${operatorfname} ${operatorlname}`
                                      : "") ||
                                      // ( operatorfname +
                                      //   " " +
                                      //   operatorlname))
                                      // || ((employeeResponse?.[station]?.[shift] && employeeDataString[employeeResponse[station][shift][0]]) ?
                                      // employeeDataString[employeeResponse[station][shift][0]].split(',')[0].trim()
                                      // : '')

                                      (employeeResponse?.[station]?.[shift] &&
                                      employeeResponse?.[station]?.[shift]?.[0]
                                        ? (() => {
                                            const name = employeeDataString[
                                              employeeResponse[station][
                                                shift
                                              ][0]
                                            ]
                                              .split(",")[0]
                                              .trim();

                                            return name;
                                          })()
                                        : "")}
                                  </p>
                                  <p style={{ fontSize: "12px" }}>
                                    Skill :&nbsp;
                                    {isRunning || runningOnLogs
                                      ? runempSkill
                                      : empSkill ||
                                        (employeeResponse?.[station]?.[shift] &&
                                        employeeResponse[station][shift][0]
                                          ? (() => {
                                              const skill = employeeDataString[
                                                employeeResponse[station][
                                                  shift
                                                ][0]
                                              ]
                                                .split(",")[1]
                                                .trim();
                                              return skill;
                                            })()
                                          : "")}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="task_stations_right">
                              <input
                                className="task_station_input"
                                placeholder="prec."
                                value={
                                  `PP-${s}`
                                  // (processName[selectedLine]?.[s - 1]
                                  //   ?.process_precedency !== undefined
                                  //   ? processName[selectedLine][s - 1]
                                  //       .process_precedency
                                  //   : "")
                                }
                                // onChange={(e) =>
                                //   handlePrecedenceVal(e, station)
                                // }
                                disabled
                              />

                              <input
                                className="task_station_input"
                                type="number"
                                value={
                                  // If the user has entered a value for the station, show it; otherwise, show the value from the API or default to 0
                                  userEnteredValue[station] ||
                                  // globalInputValue[selectedLine]?.inputValue ||
                                  //   (processName?.[selectedLine]?.[s - 1]
                                  //     .Cycle_Time_secs
                                  //     ? timingDiff /
                                  //       processName?.[selectedLine]?.[s - 1]
                                  //         .Cycle_Time_secs
                                  //     : "")
                                  (processName
                                    ? processName?.[selectedLine]?.[s - 1]
                                        ?.Cycle_Time_secs
                                      ? Math.floor(
                                          timingDiff /
                                            processName[selectedLine][s - 1]
                                              .Cycle_Time_secs
                                        )
                                      : ""
                                    : "") ||
                                  ""
                                }
                                placeholder="qty"
                                onChange={(e) => handleInputChange(e, station)}
                                disabled={isRunning || runningOnLogs}
                              />

                              <div className="task_dropdown">
                                <select
                                  onChange={(e) =>
                                    handlePartChange(e.target.value, station)
                                  }
                                  disabled={isRunning || runningOnLogs}
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
                                  disabled={isRunning || runningOnLogs}
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
                                  disabled={isRunning || runningOnLogs}
                                  value={
                                    (isRunning || runningOnLogs ? employeeId:'')||
                                    (employeeCode[station]
                                      ? employeeCode[station]
                                      : empId) ||
                                    (employeeResponse?.[station]?.[shift] &&
                                      employeeResponse?.[station]?.[
                                        shift
                                      ][0]) ||
                                    ""
                                  }
                                  onChange={(e) => employeeChange(e, station)}
                                />

                                {employeeResponse?.[station] &&
                                employeeResponse[station]?.[shift]?.length >
                                  1 ? (
                                  <select
                                    value={
                                      selectedEmployee[station] ||
                                      employeeResponse[station]?.[shift][0]
                                    }
                                    onChange={(e) => {
                                      setSelectedEmployee({
                                        ...selectedEmployee,
                                        [station]: e.target.value,
                                      }); // Update selectedEmployees state

                                      employeeChange(e, station);
                                    }}
                                  >
                                    {employeeResponse[station]?.[shift].map(
                                      (employee) => (
                                        <option key={employee} value={employee}>
                                          {employee}
                                        </option>
                                      )
                                    )}
                                  </select>
                                ) : (
                                  ""
                                )}
                              </div>

                              {/* Show a message if part and process are selected but employee ID is missing
                              {selectedProcesses[station] &&
                                !employeeCode[station] && (employeeResponse?.[station]?.[shift] &&
                                  employeeResponse?.[station]?.[
                                    shift
                                  ][0])&&(
                                  <p style={{ color: "red", fontSize: "12px" }}>
                                    Employee ID is required
                                  </p>
                                )} */}
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
