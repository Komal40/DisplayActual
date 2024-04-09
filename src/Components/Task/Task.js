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
      const lineKey = `${floor_no} L${
        buttonNumber > 9 ? buttonNumber : "0" + buttonNumber
      }`;
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
    setIndSelPart((prevState) => ({ ...prevState, [stationId]: partNo }));
    // Filter the parts_data to get processes for the selected part
    const partData = floorData.parts_data?.find(
      (data) => data.part_no === partNo
    );
    if (partData) {
      setIndSelProcess((prevState) => ({
        ...prevState,
        [stationId]: partData.process_data || [],
      }));
      // Update selected process based on the newly selected part
      const processNo =
        partData.process_data.length > 0
          ? partData.process_data[0].process_no
          : "";
      setSelectedProcesses((prevState) => ({
        ...prevState,
        [stationId]: processNo,
      }));
    } else {
      // If partData is not found, clear the selected process
      setIndSelProcess((prevState) => ({ ...prevState, [stationId]: [] }));
      setSelectedProcesses((prevState) => ({ ...prevState, [stationId]: "" }));
    }
    console.log("indSelPart", indSelPart);
  };

  const setIndividualProcess = (processNo, stationId) => {
    setSelectedProcesses((prevState) => ({
      ...prevState,
      [stationId]: processNo,
    }));
    console.log("indSelProcess", indSelProcess);
  };

  // Function to update quantity for all stations
  // const setWholeQty = (e, lineNo) => {
  // const { value } = e.target;
  // const updatedQuantities = {};
  // Object.keys(stationQuantities).forEach((stationId) => {
  //   updatedQuantities[stationId] = value;
  // });
  // Iterate through all stations
  // Object.keys(stationQuantities).forEach((stationId) => {
  // Extract line number from stationId
  // const stationLineNo = stationId.split(" ")[2]; // Assuming stationId format is "G01 F02 L01 S01"
  // Check if the station belongs to the specified line number
  // if (stationLineNo === lineNo) {
  // updatedQuantities[stationId] = value;
  // }
  // });
  // setStationQuantities(updatedQuantities);
  // setQty(value);
  // };

  // Function to update quantity for a particular station
  const setIndividualStationQty = (e, stationId) => {
    const { value } = e.target;
    // Get the value from the API
    const apiValue = stationQuantities[stationId];

    // If the user-entered value is different from the API value, use the user-entered value
    const newValue = value !== apiValue ? value : apiValue;

    // Update the state with the new value
    setStationQuantities({ ...stationQuantities, [stationId]: newValue });
  };

  const assignTask = async () => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/assign_task";
    const fullLink = link + endPoint;
    const tasksArray = []; // Initialize an empty array to store task objects

    // Loop through each station and its tasks
    Object.keys(stationData).forEach((stationId) => {
      const tasks = stationData[stationId];

      // If station has tasks, check if quantity or part/process selection has changed
      const quantityChanged = stationQuantities[stationId] !== tasks.quantity;
      const partChanged = indSelPart[stationId] !== tasks.part_no;
      const processChanged = selectedProcesses[stationId] !== tasks.process_no;

      // Check if part number and process number are selected for the station
      if (
        (indSelPart[stationId] && selectedProcesses[stationId]) ||
        (tasks.length > 0 && tasks[0].part_no && tasks[0].process_no)
      ) {
        // Create a new task object for the station
        const newTask = {
          station_id: stationId,
          employee_id:
            selectedEmployees[stationId]?.employee_id ||
            (tasks.length > 0 ? tasks[0].employee_id : ""),
          part_no:
            indSelPart[stationId] || (tasks.length > 0 ? tasks[0].part_no : ""),
          process_no:
            selectedProcesses[stationId] ||
            (tasks.length > 0 ? tasks[0].process_no : ""),
          shift: "A",
          start_shift_time: startShiftTime,
          end_shift_time: endShiftTime,
          assigned_by_owner: login.employee_id,
          total_assigned_task:
          // Check if the user has entered a value for the station, if not, use the value from the API or default to an empty string
          userEnteredValue[stationId] !== undefined
            ? userEnteredValue[stationId]
            : stationQuantities[stationId] !== undefined
            ? stationQuantities[stationId]
            : tasks.length > 0
            ? tasks[0].total_assigned_task
            : "",
      };
        tasksArray.push(newTask);
        console.log("Task for station", stationId, ":", newTask);
      }
    });

    console.log("Simulating task assignment:");
    console.log("Tasks Array:", tasksArray);
    console.log("Task Assigned Successfully");

    // Prepare the request body
    // const params = new URLSearchParams();
    // params.append("tasks", JSON.stringify(tasksArray));

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
        console.log("Task Assigned Successfully", data);
      } else {
        console.error("Failed to assign tasks", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    console.log("indSelPart updated:", indSelPart);
  }, [indSelPart]);

  
  const freeStation = async ( lineNo) => {
  
    const link = process.env.REACT_APP_BASE_URL;
    console.log("Base URL:", link);
    const endPoint = "/floorincharge/free_station";
    const fullLink = link + endPoint;
  
    // Filter stationData to include only stations belonging to the specified line
    const lineStationsData = Object.keys(stationData)
      .filter((stationId) => stationId.startsWith(lineNo))
      .map((stationId) => ({ station_id: stationId }));
  
    try {
      const response = await fetch(fullLink, {
        method: "POST",
        body: JSON.stringify({ station_ids: lineStationsData }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        // Handle success response here
        console.log("Stations on line", lineNo, "freed successfully");
      } else {
        // Handle error response here
        console.error("Failed to free stations on line", lineNo);
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

  const [selectedEmployees, setSelectedEmployees] = useState({});

  const handleEmployeeChange = (e, stationId) => {
    if (e.target && e.target.value) {
      const { value } = e.target;
      const selectedEmployee = floorData.formatted_employee_data.find(
        (employee) => employee.employee_name === value
      );
      if (selectedEmployee) {
        setSelectedEmployees((prevState) => ({
          ...prevState,
          [stationId]: {
            employee_id: selectedEmployee.employee_id,
            employee_name: selectedEmployee.employee_name,
          },
        }));
      }
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
            <button className="task_right_btn" onClick={()=>freeStation(lineNo)}>
              Add
            </button>
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

            {/* <p>Enter Quantity</p>
            <input
              className="task_qty_input"
              value={qty}
              onChange={setWholeQty}
            />
            <p>Or</p> */}
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
          {stationData &&
            Object.entries(stationData).map(([stationId, tasks]) => (
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
                      (indSelProcess[stationId]?.[0]?.process_no !==
                        undefined &&
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
                    <p className="employee-name">
                      Employee:{" "}
                      {/* {selectedEmployees[stationId] ||
                        (tasks.length > 0 ? tasks[0].employee_name : "")} */}
                      {(selectedEmployees[stationId] &&
                        selectedEmployees[stationId].employee_name) ||
                        (tasks.length > 0 ? tasks[0].employee_name : "")}
                    </p>
                  </div>
                </div>

                <div className="task_stations_right">
                <input
  className="task_station_input"
  value={
    // If the user has entered a value for the station, show it; otherwise, show the value from the API or default to 0
    userEnteredValue[stationId] !== undefined
      ? userEnteredValue[stationId]
      : stationQuantities[stationId] !== undefined
      ? stationQuantities[stationId]
      : tasks.length > 0
      ? tasks[0].total_assigned_task
      : ""
  }
  onChange={(e) => handleInputChange(e, stationId)}
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
                    <select
                      onChange={(e) => handleEmployeeChange(e, stationId)}
                    >
                      <option value="">Select</option>
                      {floorData.formatted_employee_data.map(
                        (employee, idx) => (
                          <option key={idx} value={employee.employee_name}>
                            {employee.employee_name}
                          </option>
                        )
                      )}
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
