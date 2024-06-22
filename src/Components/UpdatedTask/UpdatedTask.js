import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UpdatedTask() {
  const [parts, setParts] = useState([]);
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
        setParts(data.data);
      } else {
        console.error("Failed to fetch parts");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const [processes, setProcesses] = useState({});
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

  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  //   const tokenExpired = useTokenExpirationCheck(token, navigate);
  const login = JSON.parse(localStorage.getItem("Login"));
  const stationData = JSON.parse(localStorage.getItem("stationData"));
  const [startShiftTime, setStartShiftTime] = useState("");
  const [endShiftTime, setEndShiftTime] = useState("");

  const [selectedLine, setSelectedLine] = useState(1);
  const [line, setLine] = useState(null);

  useEffect(() => {
    if (stationData) {
      initializeArray(stationData.totalLines + 1);
    }
    if (stationData.lines && stationData.lines.length > 0) {
      handleLineClick(stationData.lines[0]);
    }
  }, []);

  const [lineStations, setLineStations] = useState(null);
  const handleLineClick = async (line) => {
    // line=G01 F02 L01
    const data = parseInt(line.split("L")[1]);
    setSelectedLine(data);
    setLine(line);
    // Parse the stations data from the state
    const allStations = stationData.stations;
    // // Find stations corresponding to the selected line
    const stationsForSelectedLine = allStations[line] || [];
    setLineStations(stationsForSelectedLine);
  };

  const [shift, setShift] = useState("");
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

  useEffect(() => {
    getParts();
  }, []);

  const [globalInputValue, setGlobalInputValue] = useState([]);
  const [globalPart, setGlobalPart] = useState("");
  const initializeArray = (size) => {
    const initialArray = Array(size)
      .fill(null)
      .map(() => ({
        part: "",
        inputValue: "",
        checked: false,
      }));
    setGlobalInputValue(initialArray);
  };

  const updateElementAtIndex = (index, field, newValue) => {
    setGlobalInputValue((prev) => {
      const newArray = [...prev];
      newArray[index] = {
        ...newArray[index],
        [field]: newValue,
        checked: true,
      };
      return newArray;
    });
  };

  console.log("globalInputValue", globalInputValue);

  const [selectedParts, setSelectedParts] = useState({});
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

  const [processName, setProcessName] = useState([]);
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
          const processesData = data.data;
          setProcessName((prevProcessName) => ({
            ...prevProcessName,
            [line]: processesData,
          }));
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

  console.log("processName", processName);

  function extractValue(str) {
    const regex = /L(\d+)/;
    const match = str.match(regex);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return null;
  }

  const extractStation = (stationId) => {
    return parseInt(stationId.split(" ")[3].substring(1));
  };

  const handlePartChange = (e, stationId) => {
    const selectedPartNo = e;
    setSelectedParts((prevParts) => {
      const updatedParts = { ...prevParts, [stationId]: selectedPartNo };
      console.log("selectedParts", updatedParts); // Log the updated state
      getProcesses(selectedPartNo, stationId); // Call getProcesses with the new value
      return updatedParts; // Return the updated state
    });
    setSelectedProcesses((prevProcesses) => ({
      ...prevProcesses,
      [stationId]: "",
    })); // Reset corresponding process information
  };

  const [selectedProcesses, setSelectedProcesses] = useState({});
  const handleProcessChange = (e, stationId) => {
    const selectedProcessNo = e.target.value;
    const selectedProcess = processes[stationId].find(
      (process) => process.process_no == selectedProcessNo
    );

    setSelectedProcesses((prevProcesses) => ({
      ...prevProcesses,
      [stationId]: selectedProcessNo,
    }));

    // if (selectedProcess) {
    //   setSelectedSkill((prevSkill) => ({
    //     ...prevSkill,
    //     [stationId]: selectedProcess.skill_level,
    //   }));
    //   setSelectPrecedency((prevPrec) => ({
    //     ...prevPrec,
    //     [stationId]: selectedProcess.process_precedency,
    //   }));
    // }
    console.log("selectedProcesses", selectedProcesses);
  };


  const [showStation, setShowStation] = useState({});
  // Handle checkbox change for showing stations
  // const handleCheckboxChange = (index, checked, station) => {
  //   setShowStation(prevState => ({
  //     ...prevState,
  //     [station]: { checked: !showStation[station]?.checked  }
  //   }));
  // };
  
   // Handle checkbox change for showing stations
   const handleCheckboxChange = (station) => {
    setShowStation(prevState => ({
      ...prevState,
      [station]: !prevState[station]
    }));
  };


  return (
    <div>
      <div className="task__main">
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
              <select
              //   onChange={handleStartShiftChange} value={startShiftTime}
              >
                <option>Start</option>
                {/* {startTimeOptions} */}
              </select>
            </div>
            <div className="update_dropdown">
              <select
              //   onChange={handleEndShiftChange} value={endShiftTime}
              >
                <option>End</option>
                {/* {endTimeOptions} */}
              </select>
            </div>

            <div>
              <input
                className="task_id"
                placeholder="TaskId"
                pattern="[0-9]{4}" // This pattern allows only 4 numeric characters
                title="Please enter exactly 4 numeric characters"
                minLength={4}
                // value={taskId}
                // onChange={handleChange}
              />
              {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
            </div>

            {/* <button className="task_qty_btn">Fetch From Quantity</button> */}
            <div className="task_btnss">
              <div>
                <button
                  className="task_assign_btn"
                  //  onClick={deleteTask}
                >
                  Delete Task
                </button>
              </div>
              <div>
                <button
                  className="task_assign_btn"
                  // onClick={assignTask}
                >
                  Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="update_dropdown">
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
                <button className="task_assign_btn">Assign Employee</button>
              </div>
              <div>
                <button className="task_assign_btn">Fetch From Quantity</button>
              </div>
            </div>
          </div>
        </div>

        <div className="task_stations_container">
          {lineStations &&
            lineStations.map((stationId) => {
              const s = extractStation(stationId);

              return (
                <>
                  <div key={stationId} className="task_stations">
                    <div className="task_stations_left">
                      <h4>
                        <span style={{ marginRight: "10px" }}>
                          {/* <input
                            type="checkbox"
                            className="input_checkbox"
                            checked={
                              globalInputValue[selectedLine]?.checked || false
                            }
                            onChange={(e) => {
                              updateElementAtIndex(
                                selectedLine,
                                "checked",
                                e.target.checked
                              );
                            }}
                          /> */}
                           {/* <input
                                      type="checkbox"
                                      className="input_checkbox"
                                      checked={showStation[stationId]}
                                      onChange={(e) => handleCheckboxChange( stationId)}
                                    /> */}
                        </span>
                        {stationId}
                      </h4>

                      <div className="task_stations_part">
                        <p>
                          Part:{" "}
                          {selectedParts[stationId] ||
                            globalInputValue[selectedLine]?.part}{" "}
                        </p>
                      </div>

                      <div className="task_stations_part">
                        <p>
                          Process:{" "}
                          {selectedProcesses[stationId] ||
                            (globalInputValue[selectedLine]?.part
                              ? processName[selectedLine]?.[s - 1]?.process_no
                              : "")}{" "}
                        </p>
                        <p style={{ fontSize: "12px" }}>
                          Skill Required:&nbsp;
                        </p>
                      </div>

                      <div className="task_stations_part">
                        <p className="employee-name">Employee: </p>
                        <p style={{ fontSize: "12px" }}>Skill :&nbsp;</p>
                      </div>
                    </div>

                    <div className="task_stations_right">
                      <input
                        className="task_station_input"
                        placeholder="prec."
                      />

                      <input className="task_station_input" />

                      <div className="task_dropdown">
                        <select
                          // value={selectedParts[stationId]}
                          onChange={(e) =>
                            handlePartChange(e.target.value, stationId)
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

                      <div className="task_dropdown">
                        <select
                          onChange={(e) => handleProcessChange(e, stationId)}
                        >
                          <option>Select</option>
                          {processes[stationId] &&
                            processes[stationId].map((process, index) => (
                              <option key={index} value={process.process_no}>
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
                        />
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default UpdatedTask;

// const myStationData:myStations[] = await callPOSTAPI()

// myStationData.employeeName

// var recievedData = await callPOSTAPI()

// //SEPERATE
// fun callPOSTAPI(var endpoint:String, var mymethod:String, var params):String{
//   try{
// var fullink = BASEURL + endpoint
// const response = await fetch(fullLink, {
//   method: mymethod,
//   body: params,
//   headers: {
//     "Content-type": "application/x-www-form-urlencoded",
//     Authorization: `Bearer ${token}`,
//   },
// });
// fetch(url)

// if(response.code == 200){
//   return response.json
// }
//   }catch(){
//   }
// }

// class myStations{

//   var statioName: String
//   var employeeName: String

// }

// {

//   stationName: " G01 F01"
//   employeeName: "Amit"
// }
