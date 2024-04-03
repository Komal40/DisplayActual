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
  const tokenExpired = useTokenExpirationCheck(token, navigate);
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const [lineNo, setLineNo] = useState("");
  const totalLines = JSON.parse(localStorage.getItem("TotalLines"));

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
      const lineKey = `G01 F02 L0${buttonNumber}`; // Assuming lineKey format
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

  const [selectedPart, setSelectedPart] = useState('');
  const [indSelPart, setIndSelPart]=useState('')
  const [indSelProcess, setIndSelProcess]=useState([])
const [selectedProcesses, setSelectedProcesses] = useState([]);

const handlePartChange = (partNo) => {
  setSelectedPart(partNo);
  // Filter the parts_data to get processes for the selected part
  const selectedPartData = floorData.parts_data?.find((data) => data.part_no == partNo);
  if (selectedPartData) {
    setSelectedProcesses(selectedPartData.process_data);
  } else {
    setSelectedProcesses([]);
  }

  console.log("selectedPart", selectedPart)
  console.log("selectedProcesses", selectedProcesses)
};

// const setIndividualPartNo = (partNo) => {
    
//     setIndSelPart(partNo);
  
//     // Filter the parts_data to get processes for the selected part
//     const partData = floorData.parts_data?.find((data) => data.part_no === partNo);
//     if (partData) {
//       setIndSelProcess(partData.process_data);
//     } else {
//       setIndSelProcess([]);
//     }
//   };

const setIndividualPartNo = (partNo, stationId) => {
    setIndSelPart({ ...indSelPart, [stationId]: partNo });
     // Filter the parts_data to get processes for the selected part
  const partData = floorData.parts_data?.find((data) => data.part_no === partNo);
  if (partData) {
    setIndSelProcess({ ...indSelProcess, [stationId]: partData.process_data });
  } else {
    setIndSelProcess({ ...indSelProcess, [stationId]: [] });
  }
  };

  const setIndividualProcess = (processNo, stationId) => {
    setSelectedProcesses({ ...selectedProcesses, [stationId]: processNo });
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
            <button className="task_right_btn">Add</button>
          </div>
        </div>
        <hr />

        <div className="task_buttons">
          {Array.from({ length: totalLines }).map((_, index) => (
            <button
              key={index}
              className={activeButton === index + 1 ? "active" : ""}
              onClick={() => handleButtonClick(index + 1)}
            >
              Line {index + 1}
            </button>
          ))}
        </div>

        <div className="task_qty_section">
          <div className="task__qty">
            <p>Enter Quantity</p>
            <input className="task_qty_input" />
            <p>Or</p>
            <button className="task_qty_btn">Fetch From Quantity</button>
          </div>

          <div className="task_dropdown">
            <p>Select Part Name:</p>
            <div className="update_dropdown">
              <select onChange={(e) => handlePartChange(e.target.value)}>
                <option >Select</option>
                {floorData.parts_data &&
                  floorData.parts_data.map((data, idx) => (
                    <option key={idx}>{data.part_no}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="task_stations_container">
          {Object.entries(stationData).map(([stationId, tasks]) => (
            <div key={stationId} className="task_stations">
              <div className="task_stations_left">
                <h4>{stationId}</h4>
                {/* {tasks.length === 0 ? (
                  <p>No tasks assigned</p>
                ) : (
                  tasks.map((task, idx) => (
                    <React.Fragment key={idx}>
                      <div className="task_stations_part">
                        <p>Part: {task.part_no}</p>
                      </div>
                      <div className="task_stations_part">
                        <p>Process: {task.process_no}</p>
                      </div>
                      <div className="task_stations_part">
                        <p>Employee: {task.employee_name}</p>
                      </div>
                    </React.Fragment>
                  ))
                )} */}

<div className="task_stations_part">
  {/* <p>Part: {tasks.length > 0 ? tasks[0].part_no :selectedPart}</p> */}
  {/* <p>
          Part: {tasks.length > 0 && indSelPart === "" && stationId in floorData.station_data
            ? (tasks[0].part_no || selectedPart)
            : indSelPart}
        </p> */}

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
                  {/* <p>Process: {tasks.length > 0 ? tasks[0].process_no :''}</p> */}
                  <p>Process: {selectedProcesses[stationId] || (tasks.length > 0 ? tasks[0].process_no : '')}</p>
                </div>
                <div className="task_stations_part">
                  <p>
                    Employee: {tasks.length > 0 ? tasks[0].employee_name : ""}
                  </p>
                </div>
              </div>

              {/* <div className="task_stations_right">
                {tasks.length === 0 ? (
                  <p>No tasks assigned</p>
                ) : (
                  tasks.map((task, idx) => (
                    <React.Fragment key={idx}>
                      <input className="task_station_input" />
                      <div className="task_dropdown">
                        <select>
                          <option>Change</option>
                        </select>
                      </div>
                      <div className="task_dropdown">
                        <select>
                          <option>Change</option>
                        </select>
                      </div>
                      <div className="task_dropdown">
                        <select>
                          <option>Change</option>
                        </select>
                      </div>
                    </React.Fragment>
                  ))
                )}
              </div> */}

              <div className="task_stations_right">
                <input className="task_station_input" />
                <div className="task_dropdown">
                <select onChange={(e)=>setIndividualPartNo(e.target.value,stationId)}>
                <option>Select</option>
                {floorData.parts_data &&
                  floorData.parts_data.map((data, idx) => (
                    <option key={idx}>{data.part_no}</option>
                  ))}
              </select>
                </div>
                <div className="task_dropdown">
                {/* <select>
                    <option>Select</option> */}
                {/* {selectedPart !== "" &&
    floorData.parts_data
      .find((data) => data.part_no == selectedPart)
      .process_data.map((process, idx) => (
        <option key={idx}>{process.process_no}</option>
      ))} */}

                {/* </select> */}
                  {/* {selectedProcesses.map((process, idx) => (
    <option key={idx} value={process.process_no}>
      {process.process_name}
    </option>
  ))} */}
  <select onChange={(e)=>setIndividualProcess(e.target.value, stationId)}>
  <option>Select</option>
  {indSelProcess[stationId]?.map((process, idx) => (
    <option key={idx} value={process.process_no}>{process.process_no}</option>
  ))}
</select>
 
                </div>{" "}
                <div className="task_dropdown">
                  <select>
                    <option>Change</option>
                    {/* {
                        indSelProcess.map((process, idx)=>(
                            <option>{process.process_no}</option>
                        ))
                    } */}
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