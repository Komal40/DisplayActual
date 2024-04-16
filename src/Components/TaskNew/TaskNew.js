import React, { startTransition, useEffect, useState } from "react";
import DashBoardAbove from "../DashboardR/DashBoardAbove";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import Line from "../Line/Line";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TaskNew() {
  const [stationData, setStationData] = useState({});
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const [selectedLine, setSelectedLine] = useState(1);
  const [parts, setParts] = useState([]);
  const [processes, setProcesses] = useState({});
  const [processName, setProcessName] = useState([]);

  const [selectedParts, setSelectedParts] = useState({});
  const [selectedProcesses, setSelectedProcesses] = useState({});

  const [selectedPartNo, setSelectedPartNo] = useState("");
  const [selectedProcessNo, setSelectedProcessNo] = useState("");

  const [startShiftTime, setStartShiftTime] = useState("");
  const [endShiftTime, setEndShiftTime] = useState("");

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
    const selectedPartNo = e.target.value;
    setSelectedParts({ ...selectedParts, [stationId]: selectedPartNo });
    getProcesses(selectedPartNo, stationId);
  };

  const handleProcessChange = (e, stationId) => {
    const selectedProcessNo = e.target.value;
    setSelectedProcesses({ ...selectedProcesses, [stationId]: selectedProcessNo });
  };

//   const handleProcessChange = (e, stationId) => {
//     const selectedProcessNo = e.target.value;
//     setSelectedProcessNo(selectedProcessNo);
//   };

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
        console.log("object processName", processName);
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
  };

  function generateTimeOptions() {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour < 10 ? "0" + hour : hour}:${
          minute === 0 ? "00" : minute
        }:00`;
        options.push(<option key={time}>{time}</option>);
      }
    }
    return options;
  }

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
      <ToastContainer />
      <div>
        <DashBoardAbove />
      </div>

      <div className="task__main">
        <div className="task__head">
          <div className="task_left_head">
            <p className="task_left_view">View Running Task</p>
            <button className="task_left_btn"> View</button>
          </div>

          <div className="task_right_head">
            <p className="task_right_view">Add Previous Task to Logs</p>
            <button className="task_right_btn">Add</button>
          </div>
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
                {generateTimeOptions()}
              </select>
            </div>

            <div className="update_dropdown">
              <select onChange={handleEndShiftChange}>
                <option>End </option>
                {generateTimeOptions()}
              </select>
            </div>

            <button className="task_qty_btn">Fetch From Quantity</button>
            <div>
              <button className="task_assign_btn">Assign Task</button>
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
                    {stations.map((station, indx) => {
                      return (
                        <div key={station} className="task_stations">
                          <div className="task_stations_left">
                            <h4>{station}</h4>
                            <div className="task_stations_part">
                              <p>Part: {selectedParts[station] || ""}</p>
                            </div>
                            <div className="task_stations_part">
                              <p>Process: {selectedProcesses[station] || ""}</p>
                            </div>
                            <div className="task_stations_part">
                              <p className="employee-name">Employee: </p>
                            </div>
                          </div>

                          <div className="task_stations_right">
                            <input className="task_station_input" />
                            <div className="task_dropdown">
                              <select
                                onChange={(e) => handlePartChange(e, station)}
                              >
                                <option value="">Select</option>
                                {parts &&
                                  parts.map((data, idx) => (
                                    <option key={idx}>{data.part_no}</option>
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
                                    <option key={index}>
                                      {process.process_no}
                                    </option>
                                  ))}
                              </select>
                            </div>{" "}
                            <div className="task_dropdown">
                              <select>
                                <option value="">Select</option>
                              </select>
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
      </div>
    </>
  );
}

export default TaskNew;