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
          initializeArray(totalLines + 1);
          // setStationData({
          //   stations: stations,
          //   lines: lines,
          //   totalLines: totalLines,
          // });
          setStationData({ stations, lines, totalLines });
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

  const extractStation = (identifier) => {
    const regex = /S(\d+)/;
    const match = identifier.match(regex);

    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return null;
  };

  const [activeBtn, setActiveBtn] = useState("All");
  const [selectedLine, setSelectedLine] = useState(0);
  const [lineSelect, setLineSelect] = useState("");
  const [selectedStationsForLine, setSelectedStationsForLine] = useState("");

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
    setSelectedStationsForLine(stationsForSelectedLine);
    setLineSelect(stationsForSelectedLine);
    console.log("stationsForSelectedLine", stationsForSelectedLine);
  };

  const handleAllClick = (data = stationData) => {
    setActiveBtn("All");
    setSelectedLine(0);

    const allStations = data ? Object.values(data.stations).flat() : [];
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
    // setSelectedProcesses(prevProcesses => ({ ...prevProcesses, [stationId]: "" })); // Reset corresponding process information

    setSelectedParts((prevParts) => {
      const updatedParts = { ...prevParts, [stationId]: selectedPartNo };
      console.log("selectedParts", updatedParts); // Log the updated state
      getProcesses(selectedPartNo, stationId); // Call getProcesses with the new value
      return updatedParts; // Return the updated state
    });
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
    const value = e.target.value.trim();
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
  const [checkedLine, setCheckedLine] = useState(false);

  const checkToggle = (stationId) => {
    setChecked((prevChecked) => ({
      ...prevChecked,
      [stationId]: !prevChecked[stationId],
    }));
  };


  const updateTaskAssign = async () => {
    if (shift == "") {
      alert("Select Shift");
      return;
    }

    const taskArray = generateAllStations()
      .filter((station) => checkedStations[station]) // Filter checked stations
      .filter((station) => {
        const partSelected = selectedParts[station] !== undefined || globalInputValue[selectedLine]?.part;
        const processSelected = selectedProcesses[station] !== undefined ||processName[selectedLine]?.[0]?.process_no;
        const quantityEntered = quantities[station] !== undefined || globalInputValue[selectedLine]?.inputValue;
        const operatorId = employeeCode[station] !== undefined ;
        return partSelected && processSelected && quantityEntered && operatorId;
      })
      .map((station,index) => ({
        station_id: station,
        operator_id: employeeCode[station],
        quantity: quantities[station] || globalInputValue[selectedLine]?.inputValue,
        part_no: selectedParts[station]||globalInputValue[selectedLine]?.part,
        process_no: selectedProcesses[station] ||(globalInputValue[selectedLine]?.part
          ? processName[selectedLine]?.[index]?.process_no
          : ""),
        shift: shift,
      }));

    console.log("taskarray", taskArray);
    if (taskArray.length === 0) {
      alert("Please fill all details");
      return
    }

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

  const [globalInputValue, setGlobalInputValue] = useState([]);
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

  const [headerPart, setHeaderPart] = useState("");
  const [headerQuantity, setHeaderQuantity] = useState("");
  const [headerChecked, setHeaderChecked] = useState(false);

  const handleGlobalInputChange = (e, field, selectedLine) => {
    const input = e.target.value;
    console.log("input", input);
    console.log("input selected line", selectedLine);
    updateElementAtIndex(selectedLine, field, input);
  };

  const setWholeToggle = (val,field,line) => {
    updateElementAtIndex(line,field,val);
  };

  const [selectedWholePart, setSelectedWholePart] = useState({});
  const [processName, setProcessName] = useState([]);
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
          setProcessName((prevProcessName) => ({
            ...prevProcessName,
            [line]: processesData,
          }));
        } else {
          alert(data.Message);
        }
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  console.log("processname", processName);
  console.log("lineSelect", lineSelect)



  // checked code 
  const [lineItems, setLineItems] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);

  useEffect(() => {
    if (lineSelect.length > 0) {
      setLineItems(lineSelect.map(item => ({ id: item, checked: false })));
    }
  }, [lineSelect]);


  console.log("lineItems",lineItems)
  const handleHeaderChange = () => {
    console.log(selectedLine)
    const newCheckedStatus = !isAllChecked;
    const updatedItems = lineItems.map(item => ({
      ...item,
      checked: newCheckedStatus,
    }));
    setLineItems(updatedItems);
    setIsAllChecked(newCheckedStatus);
  };








  //new logic 
  const [checkedStations, setCheckedStations]=useState({})
  const allStations=stationData.stations
  console.log("allstations",allStations)

  const generateAllStations=()=>{
    if (!stationData.stations) return [];
   if(activeBtn=='All'){
    return Object.values(allStations).flat()
   }
   return allStations[activeBtn] ||[]
  } 

  const handleStationCheckboxChange=(station)=>{
    setCheckedStations(prev=>({
      ...prev,
      [station]:!prev[station]
    }))
  }

  
  const handleGlobalCheckedBoxChange=(isChecked)=>{
    if(activeBtn=="All"){
      const newCheckedStations=Object.values(allStations).flat().reduce((acc, station)=>{
        acc[station]=isChecked
        return acc;
      }, {})
      setCheckedStations(newCheckedStations)
    }
    else{
      const newCheckedStations=(allStations[activeBtn]||[]).reduce((acc, station)=>{
        acc[station]=isChecked
        return acc;
      },{})
      setCheckedStations(newCheckedStations)
    }
  }

  console.log("Checked Stations:", checkedStations);


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
              Add Task
            </button>
          </div>
        </div>

        <div className="taskfixed_data_table">
          <div className="taskfixed_table_header">
            <div>Station ID</div>
            <div>Operator ID</div>
            <div>Name</div>
            <div>
              {/* <p>Quantity</p> */}
              <input
                placeholder="Qty"
                className="taskfixed_inp"
                value={globalInputValue[selectedLine]?.inputValue || ""}
                onChange={(e) =>
                  handleGlobalInputChange(e, "inputValue", selectedLine)
                }
              />

            </div>
            <div className="taskfixed_dropdown">
              {/* <p>Part</p> */}
              <select
                value={globalInputValue[selectedLine]?.part || ""}
                onChange={(e) =>
                  handleWholePartChange(e.target.value, "part", selectedLine)
                }
              >
                <option value="">Part</option>
                {parts &&
                  parts.map((data, idx) => (
                    <option key={idx} value={data.part_no}>
                      {data.part_no}
                    </option>
                  ))}
              </select>
            </div>
            <div className="taskfixed_dropdown">
              <p>Process</p>
              {/* <select>
                <option>process</option>
                {Array.isArray(processName[selectedLine]) && processName[selectedLine].map((process, index) => (
      <option key={`processName-${index}`} value={process.process_no}>
        {process.process_no}
      </option>
    ))}
              </select> */}


            </div>
            <div>
              <input
                type="checkbox"
                className="taskfixed_check"
                checked={
                  activeBtn === 'All'
                    ? generateAllStations().every(station => checkedStations[station])
                    : allStations && (allStations[activeBtn] || []).every(station => checkedStations[station])
                }
                onChange={(e)=>handleGlobalCheckedBoxChange(e.target.checked)}
              />
            </div>
          </div>


          {allStations &&
            generateAllStations().map((station, index) => {
              const s = extractStation(station);

              return (
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
                      value={
                        quantities[station] ||
                        globalInputValue[selectedLine]?.inputValue ||
                        ""
                      }
                      onChange={(e) => handleQuantityChange(e, station)}
                    />
                  </div>

                  <div className="task_dropdown">
                    <select
                      value={
                        selectedParts[station] ||
                        globalInputValue[selectedLine]?.part ||
                        ""
                      }
                      onChange={(e) =>
                        handlePartChange(e.target.value, station)
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
                      value={
                        selectedProcesses[station] ||
                        (globalInputValue[selectedLine]?.part
                          ? processName[selectedLine]?.[index]?.process_no
                          : "")
                      }
                      onChange={(e) => handleProcessChange(e, station)}
                    >
                      <option>Select</option>

                      {Array.isArray(processName[selectedLine]) &&
                        processName[selectedLine].map((process, index) => (
                          <option
                            key={`processName-${index}`}
                            value={process.process_no}
                          >
                            {process.process_no}
                          </option>
                        ))}

                      {Array.isArray(processes[station]) &&
                        processes[station].map((process, index) => (
                          <option
                            key={`processes-${index}`}
                            value={process.process_no}
                          >
                            {process.process_no}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="checkbox"
                      className="taskfixed_check"
                      checked={!!checkedStations[station]}
                      onChange={()=>handleStationCheckboxChange(station)}
                      // checked= {!!checked[station]}
                      // onChange={() => checkToggle(station)}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

export default AddFixedTask;
