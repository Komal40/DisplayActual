import React, { startTransition, useEffect, useState } from "react";
import "./Task.css";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import Line from "../Line/Line";

function Task() {

  const navigate = useNavigate();

  const [floorData, setFloorData] = useState({});
  const token = JSON.parse(localStorage.getItem("Token"));
  const login = JSON.parse(localStorage.getItem("Login"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const [lineNo, setLineNo] = useState("");
  const totalLines = JSON.parse(localStorage.getItem("TotalLines"));
  const [dataLoaded, setDataLoaded] = useState(false);
  const [qty, setQty] = useState("");
  const [stationQuantities, setStationQuantities] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      const link = process.env.REACT_APP_BASE_URL;
      const endPoint = "/floorincharge/get_floor_data";
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
          //   console.log("floorincharge/get_floor_data", responseData);
          setFloorData(responseData);
          console.log("floorincharge/get_floor_data", floorData);
          setDataLoaded(true);
        } else {
          const errorData = await response.text();
          console.error("API Error:", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const [activeButton, setActiveButton] = useState();
  const [stationData, setStationData] = useState({});

  const handleButtonClick = (buttonNumber) => {
    if (activeButton === buttonNumber) {
      setActiveButton(null);
      setLineNo("");
      setStationData({});
    } else {
      setActiveButton(buttonNumber);
    //   const lineKey = `${floor_no} L0${buttonNumber}`; // Assuming lineKey format
    const lineKey = `${floor_no} L${buttonNumber > 9 ? buttonNumber : '0' + buttonNumber}`;
      console.log("Selected Line Key:", lineKey);
      setLineNo(lineKey);
      // Extract station data for the selected line from the API response
      // const stationsData = floorData.station_data[lineKey] || {};
      const stationsData = Object.keys(floorData.station_data).reduce(
        (acc, stationKey) => {
          if (stationKey.startsWith(lineKey)) {
            acc[stationKey] = floorData.station_data[stationKey];
          }
          return acc;
        },
        {}
      );

      console.log("Station Data:", stationsData);
      setStationData(stationsData);
    }
  };


  const [selectedPart, setSelectedPart] = useState("");
  const [indSelPart, setIndSelPart] = useState("");
  const [indSelProcess, setIndSelProcess] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);

  const handlePartChange = (partNo) => {
    setSelectedPart(partNo);
    // Filter the parts_data to get processes for the selected part
    const selectedPartData = floorData.parts_data?.find(
      (data) => data.part_no == partNo
    );
    if (selectedPartData) {
      setSelectedProcesses(selectedPartData.process_data);
    } else {
      setSelectedProcesses([]);
    }

    console.log("selectedPart", selectedPart);
    console.log("selectedProcesses", selectedProcesses);
  };


const setIndividualPartNo = (partNo, stationId) => {
    setIndSelPart(prevState => ({ ...prevState, [stationId]: partNo }));
    // Filter the parts_data to get processes for the selected part
    const partData = floorData.parts_data?.find(data => data.part_no === partNo);
    if (partData) {
      setIndSelProcess(prevState => ({
        ...prevState,
        [stationId]: partData.process_data || [],
      }));
      // Update selected process based on the newly selected part
      const processNo = partData.process_data.length > 0
        ? partData.process_data[0].process_no
        : "";
      setSelectedProcesses(prevState => ({ ...prevState, [stationId]: processNo }));
    } else {
      // If partData is not found, clear the selected process
      setIndSelProcess(prevState => ({ ...prevState, [stationId]: [] }));
      setSelectedProcesses(prevState => ({ ...prevState, [stationId]: "" }));
    }
    console.log("indSelPart",indSelPart)
  };
  
  const setIndividualProcess = (processNo, stationId) => {
    setSelectedProcesses(prevState => ({ ...prevState, [stationId]: processNo }));
    console.log("indSelProcess",indSelProcess)
    
  };

  

  // Function to update quantity for all stations
  const setWholeQty = (e, lineNo) => {
    const { value } = e.target;
    const updatedQuantities = {};
    // Object.keys(stationQuantities).forEach((stationId) => {
    //   updatedQuantities[stationId] = value;
    // });
    // Iterate through all stations
    Object.keys(stationQuantities).forEach((stationId) => {
      // Extract line number from stationId
      const stationLineNo = stationId.split(" ")[2]; // Assuming stationId format is "G01 F02 L01 S01"
      // Check if the station belongs to the specified line number
      if (stationLineNo === lineNo) {
        updatedQuantities[stationId] = value;
      }
    });
    setStationQuantities(updatedQuantities);
    setQty(value);
  };

  // Function to update quantity for a particular station
  const setIndividualStationQty = (e, stationId) => {
    const { value } = e.target;
    setStationQuantities({ ...stationQuantities, [stationId]: value });
  };

  const assignTask = async () => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/assign_task";
    const fullLink = link + endPoint;
    const tasksArray = []; // Initialize an empty array to store task objects
  
    // Loop through each station and its tasks
    Object.keys(stationData).forEach((stationId) => {
      const tasks = stationData[stationId];
  
      // For each task in the station, create a new task object
      tasks.forEach((task) => {
        // Check if station has tasks or if it's empty
        if (tasks.length === 0) {
          // If station has no tasks, assign task with selected part number and process number
          const newTask = {
            station_id: stationId,
            employee_id: "", // Set employee_id to empty string as it's not available
            part_no: indSelPart[stationId] || "", // Get the part number selected for this station
            process_no: selectedProcesses[stationId] || "", // Get the process number selected for this station
            start_shift_time: startShiftTime, // Assuming start shift time is available elsewhere in the code
            end_shift_time: endShiftTime, // Assuming end shift time is available elsewhere in the code
            shift: "A", // Assuming shift is hardcoded to "A" for now
            assigned_by_owner: login.employee_id, // Assuming assigned_by_owner is hardcoded for now
            total_assigned_task: task.total_assigned_task || 3, // If total_assigned_task is not available, default it to 3
          };
          tasksArray.push(newTask); // Add the new task object to the tasksArray
        } else {
          // If station has tasks, check if quantity or part/process selection has changed
          const quantityChanged = stationQuantities[stationId] !== task.quantity;
          const partChanged = indSelPart[stationId] !== task.part_no;
          const processChanged = selectedProcesses[stationId] !== task.process_no;
  
          // If any change is detected, add the task to the tasksArray
          if (quantityChanged || partChanged || processChanged) {
            const newTask = {
              station_id: stationId,
              employee_id: task.employee_id || "", // If employee_id is not available, set it to an empty string
              part_no: indSelPart[stationId] || task.part_no || "", // Get the part number selected for this station
              process_no: selectedProcesses[stationId] || task.process_no || "", // Get the process number selected for this station
              start_shift_time: startShiftTime, // Assuming start shift time is available elsewhere in the code
              end_shift_time: endShiftTime, // Assuming end shift time is available elsewhere in the code
              shift: "A", // Assuming shift is hardcoded to "A" for now
              assigned_by_owner: login.employee_id, // Assuming assigned_by_owner is hardcoded for now
              total_assigned_task: task.total_assigned_task || 3, // If total_assigned_task is not available, default it to 3
            };
            tasksArray.push(newTask); // Add the new task object to the tasksArray
          }
        }
      });
      console.log("tasksArray",tasksArray)
    });
  
    // Prepare the request body
    const params = new URLSearchParams();
    params.append("tasks", JSON.stringify(tasksArray));
  
    try {
      // Send a POST request to the server with the tasks data
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
        console.log('Task Assigned Successfully', data);
      } else {
        console.error("Failed to assign tasks", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  
  function generateTimeOptions() {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour < 10 ? "0" + hour : hour}:${
          minute === 0 ? "00" : minute
        }`;
        options.push(<option key={time}>{time}</option>);
      }
    }
    return options;
  }

  const [startShiftTime, setStartShiftTime] = useState("");
  const [endShiftTime, setEndShiftTime] = useState("");

  // Function to handle change in start shift time
  const handleStartShiftChange = (e) => {
    setStartShiftTime(e.target.value);

  };

  // Function to handle change in end shift time
  const handleEndShiftChange = (e) => {
    setEndShiftTime(e.target.value);
  };


  return (
    <>
      <div>
        <DashBoardAbove />
      </div>

      <div className="task__main">
        <div className="task__head">
          <div className="task_left_head">
            <p className="task_left_view">View Running Task</p>
            <button className="task_left_btn">View</button>
          </div>

          <div className="task_right_head">
            <p className="task_right_view">Add Previous Task to Logs</p>
            <button className="task_right_btn" onClick={assignTask}>Add</button>
          </div>
        </div>
        <hr />

        <div className="task_buttons">
          {Array.from({ length: totalLines }).map((_, index) => (
            <button
              key={index}
              className={activeButton == index + 1 ? "active" : ""}
              onClick={() => handleButtonClick(index + 1)}
            >
              Line {index + 1}
            </button>
          ))}
        </div>

        <div className="task_qty_section">
          <div className="task__qty">
            <p>Select Shift Timings</p>

            <div className="update_dropdown">
              <select onChange={handleStartShiftChange}>
                <option>Start </option>
                {generateTimeOptions()}
              </select>
            </div>

            <div className="update_dropdown">
              <select onChange={handleEndShiftChange}>
                <option>End </option>
                {generateTimeOptions()}
              </select>
            </div>

            <p>Enter Quantity</p>
            <input
              className="task_qty_input"
              value={qty}
              onChange={setWholeQty}
            />
            <p>Or</p>
            <button className="task_qty_btn">Fetch From Quantity</button>
          </div>


          <div className="task_dropdown">
            {/* <p>Select Part Name:</p>
                {floorData.parts_data &&
                  floorData.parts_data.map((data, idx) => (
                    <option key={idx}>{data.part_no}</option>
                  ))}
              </select>
            </div> */}
          </div>
        </div>

        <div className="task_stations_container">
          {Object.entries(stationData).map(([stationId, tasks]) => (
            <div key={stationId} className="task_stations">
              <div className="task_stations_left">
                <h4>{stationId}</h4>              
                <div className="task_stations_part">
                  <p>
                    Part:{" "}
                    {tasks.length > 0 &&
                    (!indSelPart.hasOwnProperty(stationId) ||
                      indSelPart[stationId] == "")
                      ? tasks[0].part_no || selectedPart
                      : indSelPart[stationId]}
                  </p>
                </div>
                <div className="task_stations_part">
                  <p>
                    Process:{" "}
                    {(selectedProcesses[stationId] !== undefined &&
                      selectedProcesses[stationId] !== "") ||
                    (indSelProcess[stationId]?.[0]?.process_no !== undefined &&
                      indSelProcess[stationId]?.[0]?.process_no !== "") ||
                    (tasks && tasks.length > 0
                      ? tasks[0].process_no !== ""
                      : true)
                      ? selectedProcesses[stationId] ||
                        indSelProcess[stationId]?.[0]?.process_no ||
                        (tasks && tasks.length > 0 ? tasks[0].process_no : "")
                      : ""}
                  </p>
                </div>
                <div className="task_stations_part">
                  <p>
                    Employee: {tasks.length > 0 ? tasks[0].employee_name : ""}
                  </p>
                </div>
              </div>

           
              <div className="task_stations_right">
                <input
                  className="task_station_input"
                  value={stationQuantities[stationId] || ""}
                  onChange={(e) => setIndividualStationQty(e, stationId)}
                />
                <div className="task_dropdown">
                  <select
                    onChange={(e) =>
                      setIndividualPartNo(e.target.value, stationId)
                    }
                  >
                    <option value="">Select</option>
                    {floorData.parts_data &&
                      floorData.parts_data.map((data, idx) => (
                        <option key={idx}>{data.part_no}</option>
                      ))}
                  </select>
                </div>
                <div className="task_dropdown">
                  <select
                    onChange={(e) =>
                      setIndividualProcess(e.target.value, stationId)
                    }
                  >
                    <option value="">Select</option>
                    {indSelProcess[stationId]?.map((process, idx) => (
                      <option key={idx} value={process.process_no}>
                        {process.process_no}
                      </option>
                    ))}
                  </select>
                </div>{" "}
                <div className="task_dropdown">
                  <select>
                    <option value="">Change</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Task;


