import React, { useEffect, useState } from "react";
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
  const [lineNo, setLineNo]=useState("")
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

  const [activeButton, setActiveButton] = useState(1);
  const [stationData, setStationData] = useState({});

  const handleButtonClick = (buttonNumber) => {
    setActiveButton(buttonNumber);
    const lineKey = `${floor_no} L0${buttonNumber}`;
    // setLineNo(prevLineNo => prevLineNo == lineKey ? "" : lineKey)
    setLineNo(lineKey)
    console.log("object line no",lineNo)
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
        <hr/>

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
            <p>Enter Quantity</p>
            <input className="task_qty_input" />
            <p>Or</p>
            <button className="task_qty_btn">Fetch From Quantity</button>
          </div>

          <div className="task_dropdown">
            <p>Select Part Name:</p>
            <div className="update_dropdown">
              <select>
                <option>Select</option>
                {floorData.parts_data &&
                  floorData.parts_data.map((data, idx) => (
                    <option key={idx}>{data.part_no}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="task_stations_container">
          {/* {stationData.stations &&
            Object.entries(stationData.stations).map(([line, stations], index) => (
              <div
                key={index}
                style={{
                  display:
                    activeButton == `${parseInt(line.split("L")[1])}` 
                    ? "block" : "none",
                }}
              >
                <div className="task_stations_container">
                  {stations.map((station, idx) => (
                    <div className="task_stations" key={idx}>
                      <div className="task_stations_left">
                        <h4>F01 L02 S02</h4>
                        <div className="task_stations_part">
                          <p>Part: IMF 001</p>
                        </div>
                        <div className="task_stations_part">
                          <p>Process: IMF 001</p>
                        </div>
                        <div className="task_stations_part">
                          <p>Employee:</p>
                        </div>
                      </div>

                      <div className="task_stations_right">
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
                        </div>{" "}
                        <div className="task_dropdown">
                          <select>
                            <option>Change</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))} */}

            
        </div>
      </div>
    </>
  );
}

export default Task;