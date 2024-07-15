import React, { useEffect, useState } from "react";
import DashboardAbove from "../DashboardR/DashBoardAbove";
import { useNavigate } from "react-router-dom";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { responsivePropType } from "react-bootstrap/esm/createUtilityClasses";

function AddFixedTask() {
  const [stationData, setStationData] = useState({});
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Token"));
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);
  const login = JSON.parse(localStorage.getItem("Login"));
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
          // Set totalLines in local storage
          localStorage.setItem("TotalLines", totalLines);
          setStationData({
            stations: stations,
            lines: lines,
            totalLines: totalLines,
          });
          handleAllClick({
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

  const [activeBtn, setActiveBtn] = useState("All");
  const [selectedLine, setSelectedLine] = useState(null);
  const [lineSelect, setLineSelect] = useState("");

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
    setLineSelect(stationsForSelectedLine);
    console.log("stationsForSelectedLine", stationsForSelectedLine);
  };

  const handleAllClick = (data = stationData) => {
    setActiveBtn("All");
    setSelectedLine(null);

    const allStations = Object.values(data.stations).flat();
    setLineSelect(allStations);
  };

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

  const [selectedParts, setSelectedParts] = useState({});
  const [selectedProcesses, setSelectedProcesses] = useState({});
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

  const handleProcessChange = (e, stationId) => {
    const selectedProcessNo = e.target.value;
    const selectedProcess = processes[stationId].find(
      (process) => process.process_no == selectedProcessNo
    );
    setSelectedProcesses((prevProcesses) => ({
      ...prevProcesses,
      [stationId]: selectedProcessNo,
    }));
  };

  const [employeeCode, setEmployeeCode] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState({});
  // select employee name and skill from employee code
  const employeeChange = async (e, stationId) => {
    // const { value } = event.target;
    const value = e.target ? e.target.value.toUpperCase() : e;
    // Clear the selected employee details for the current stationId
    setSelectedEmployees((prevSelectedEmployees) => ({
      ...prevSelectedEmployees,
      [stationId]: null, // or {} depending on how you handle empty state
    }));
    // setEmployeeCode(value); // Update the employee code state
    setEmployeeCode({ ...employeeCode, [stationId]: value });

    if (value.length >= 3) {
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
    }
  };

  // Handle quantity change
  const [quantities, setQuantities] = useState({});
  const handleQuantityChange = (e, stationId) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [stationId]: value,
      }));
    }
  };

  const [shift, setShift] = useState("");
  const [startShiftTime, setStartShiftTime] = useState("");
  const [endShiftTime, setEndShiftTime] = useState("");
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

  const [checked, setChecked] = useState({});

  const checkToggle = (stationId) => {
    setChecked((prevChecked) => ({
      ...prevChecked,
      [stationId]: !prevChecked[stationId],
    }));
  };

  console.log("Checked Stations:", checked);

  const updateTaskAssign = async () => {
    if (shift == "") {
      alert("Select Shift");
      return;
    }

    const taskArray = lineSelect
      .filter((station) => checked[station]) // Filter checked stations
      .filter((station) => {
        const partSelected = selectedParts[station] !== undefined;
        const processSelected = selectedProcesses[station] !== undefined;
        const quantityEntered = quantities[station] !== undefined;
        const operatorId = employeeCode[station] !== undefined;

        return partSelected && processSelected && quantityEntered && operatorId;
      })
      .map((station) => ({
        station_id: station,
        operator_id: employeeCode[station],
        quantity: quantities[station] ,
        part_no: selectedParts[station] ,
        process_no: selectedProcesses[station] ,
        shift: shift,
      }));

    console.log("taskarray", taskArray);

    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/update_auto_task_assign_data";
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
        if (response.ok) {
          const data = await response.json();
          alert(data.Message);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <>
      <div>
        <DashboardAbove />
      </div>

      <div className="main_taskfixeddata">
        <div className="taskfixed_head">
          <h2>Add Fixed Task Data</h2>
        </div>

        <div>
          <div className="task_buttons">
            <button
              className={`${activeBtn === "All" ? "act" : ""}`}
              onClick={() => handleAllClick(stationData)}
            >
              All
            </button>
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
        </div>

        <div className="taskfixed_shifts">
          <div className="task_qty_section">
            <div className="task__qty">
              <p>Select Shift</p>
              <div className="update_dropdown">
                <select
                  value={shift}
                  onChange={(e) => setShifts(e.target.value)}
                >
                  <option value="">Shift</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <button className="task_assign_btn" onClick={updateTaskAssign}>
              Assign Task
            </button>
          </div>
        </div>

        <div className="taskfixed_data_table">
          <div className="taskfixed_table_header">
            <div>Station ID</div>
            <div>Operator ID</div>
            <div>Name</div>
            <div>
              <p>Quantity</p>
              <input className="taskfixed_inp" />
            </div>
            <div>
              <p>Part</p>
              <select
              //   onChange={(e) =>
              //     handlePartChange(e.target.value, station)
              //   }
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
            <div>
              <p>Process</p>
              <select>
                <option>process</option>
              </select>
            </div>
            <div>
              <input type="checkbox" className="taskfixed_check" />
            </div>
          </div>

          {lineSelect &&
            lineSelect.map((station, index) => (
              <div key={index} className="taskfixed_row">
                <div>{station}</div>
                <div>
                  <input
                    className="taskfixed_inp"
                    value={employeeCode[station] || ""}
                    onChange={(e) => employeeChange(e, station)}
                  />
                </div>
                <div>
                  <p>
                    {selectedEmployees[station]?.["First Name"]}{" "}
                    {selectedEmployees[station]?.["Last Name"]}
                  </p>
                </div>
                <div>
                  <input
                    className="taskfixed_inp"
                    value={quantities[station]||''}
                    onChange={(e) => handleQuantityChange(e, station)}
                  />
                </div>
                <div className="task_dropdown">
                  <select
                    value={selectedParts[station]||''}
                    onChange={(e) => handlePartChange(e.target.value, station)}
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
                    value={selectedProcesses[station] || ''}
                    onChange={(e) => handleProcessChange(e, station)}
                  >
                    <option>Select</option>
                    {processes[station] &&
                      processes[station].map((process, index) => (
                        <option key={index} value={process.process_no}>
                          {process.process_no}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <input
                    type="checkbox"
                    className="taskfixed_check"
                    checked={checked[station]}
                    onChange={() => checkToggle(station)}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}





export default AddFixedTask;