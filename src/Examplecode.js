// import React, { startTransition, useEffect, useState } from "react";
// import "./Task.css";
// import DashBoardAbove from "../DashboardR/DashBoardAbove";
// import { useNavigate } from "react-router-dom";
// import useTokenExpirationCheck from "../useTokenExpirationCheck";
// import Line from "../Line/Line";

// function Examplecode() {

//   const navigate = useNavigate();

//   const floorData = useState({
//     "All_stations": "{'G01 F02 L01': ['G01 F02 L01 S01', 'G01 F02 L01 S03', 'G01 F02 L01 S04', 'G01 F02 L01 S05', 'G01 F02 L01 S06'], 'G01 F02 L02': ['G01 F02 L02 S01', 'G01 F02 L02 S02', 'G01 F02 L02 S03', 'G01 F02 L02 S04']}",
//     "lines": "['G01 F02 L01', 'G01 F02 L02']",
//     "parts_data": [
//         {
//             "part_name": "",
//             "part_no": "IMO-12",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-17",
//             "process_data": [
//                 {
//                     "process_name": "mounting and hot sealing of connector's guide pins with PCB",
//                     "process_no": "IMO-17 PR300"
//                 },
//                 {
//                     "process_name": "Soldering of connector terminals with PCB by robotic soldring machine",
//                     "process_no": "IMO-17 PR301"
//                 },
//                 {
//                     "process_name": "Visual inspection of both side of PCB Assy. under Camera based TV monitor.",
//                     "process_no": "IMO-17 PR310"
//                 },
//                 {
//                     "process_name": "Voltage Check And IC Programming @ 13.5 v",
//                     "process_no": "IMO-17 PR320"
//                 },
//                 {
//                     "process_name": "Conformal coating on bottom side of PCB",
//                     "process_no": "IMO-17 PR340"
//                 },
//                 {
//                     "process_name": "Inspection of coil Assy & mounting of coil on PCB. Screw tightening by Robotic M/c then soldering of coil terminal with PCB",
//                     "process_no": "IMO-17 PR350"
//                 },
//                 {
//                     "process_name": "Testing-2 @ 13.5V. Soldering of capacitor selected for tuning",
//                     "process_no": "IMO-17 PR360"
//                 },
//                 {
//                     "process_name": "Programming of immo. For main application After that Automatic testing @ 13.5V and after that vibration testing on part",
//                     "process_no": "IMO-17 PR370"
//                 },
//                 {
//                     "process_name": "Conformal coating on top side of PCB",
//                     "process_no": "IMO-17 PR390"
//                 },
//                 {
//                     "process_name": "Visual inspection of top side of PCB Assy. After that Fixing of coil cover. Illumination ring and housing",
//                     "process_no": "IMO-17 PR410"
//                 },
//                 {
//                     "process_name": "Illumination ring checking by Camera based system only for W601 (IMO22)",
//                     "process_no": "IMO-17 PR411"
//                 },
//                 {
//                     "process_name": "Testing of illumination",
//                     "process_no": "IMO-17 PR420"
//                 },
//                 {
//                     "process_name": "Checking fitment of round cover and hole matching with key cylinder and final testing at 9V & 16V then barcode sticker pasting on part",
//                     "process_no": "IMO-17 PR430"
//                 },
//                 {
//                     "process_name": "Firewall - Autotesting testing & verification of previous check marks",
//                     "process_no": "IMO-17 PR440"
//                 }
//             ]
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-19",
//             "process_data": [
//                 {
//                     "process_name": "Hardware",
//                     "process_no": "7"
//                 }
//             ]
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-20",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-23",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-45",
//             "process_data": [
//                 {
//                     "process_name": "Coating",
//                     "process_no": "6"
//                 }
//             ]
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-50",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-8",
//             "process_data": []
//         }
//     ],
//     "station_data": {
//         "G01 F02 L01 S01": [],
//         "G01 F02 L01 S03": [],
//         "G01 F02 L01 S04": [
//             {
//                 "employee_id": "E04",
//                 "employee_name": "yogesh",
//                 "employee_skill_level": "3",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR301",
//                 "station_id": "G01 F02 L01 S04",
//                 "total_assigned_task": 300
//             }
//         ],      
//         "G01 F02 L02 S01": [
//             {
//                 "employee_id": "E07",
//                 "employee_name": "bhavna",
//                 "employee_skill_level": "4",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR304",
//                 "station_id": "G01 F02 L02 S01",
//                 "total_assigned_task": 300
//             }
//         ],
//         "G01 F02 L02 S02": [
//             {
//                 "employee_id": "E08",
//                 "employee_name": "mansi",
//                 "employee_skill_level": "6",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR305",
//                 "station_id": "G01 F02 L02 S02",
//                 "total_assigned_task": 300
//             }
//         ],
//         "G01 F02 L02 S03": [
//             {
//                 "employee_id": "E80",
//                 "employee_name": "harshit",
//                 "employee_skill_level": "7",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR325",
//                 "station_id": "G01 F02 L02 S03",
//                 "total_assigned_task": 300
//             }
//         ],
//         "G01 F02 L02 S04": []
//     },
//     "totalLines": "2"
// });


//   const token = JSON.parse(localStorage.getItem("Token"));
//   const login = JSON.parse(localStorage.getItem("Login"));
//   const floor_no = JSON.parse(localStorage.getItem("floor_no"));
//   const [lineNo, setLineNo] = useState("");
//   const totalLines = JSON.parse(localStorage.getItem("TotalLines"));
//   const [qty, setQty] = useState("");
//   const [stationQuantities, setStationQuantities] = useState({});

//   const [activeButton, setActiveButton] = useState();
//   const [stationData, setStationData] = useState({});

//   const handleButtonClick = (buttonNumber) => {
//     if (activeButton === buttonNumber) {
//       setActiveButton(null);
//       setLineNo("");
//       setStationData({});
//     } else {
//       setActiveButton(buttonNumber);
//     //   const lineKey = `${floor_no} L0${buttonNumber}`; // Assuming lineKey format
//     const lineKey = `${floor_no} L${buttonNumber > 9 ? buttonNumber : '0' + buttonNumber}`;
//       console.log("Selected Line Key:", lineKey);
//       setLineNo(lineKey);
//       // Extract station data for the selected line from the API response
//       // const stationsData = floorData.station_data[lineKey] || {};
//       const stationsData = Object.keys(floorData.station_data).reduce(
//         (acc, stationKey) => {
//           if (stationKey.startsWith(lineKey)) {
//             acc[stationKey] = floorData.station_data[stationKey];
//           }
//           return acc;
//         },
//         {}
//       );

//       console.log("Station Data:", stationsData);
//       setStationData(stationsData);
//     }
//   };


//   const [selectedPart, setSelectedPart] = useState("");
//   const [indSelPart, setIndSelPart] = useState("");
//   const [indSelProcess, setIndSelProcess] = useState([]);
//   const [selectedProcesses, setSelectedProcesses] = useState([]);

//   const handlePartChange = (partNo) => {
//     setSelectedPart(partNo);
//     // Filter the parts_data to get processes for the selected part
//     const selectedPartData = floorData.parts_data?.find(
//       (data) => data.part_no == partNo
//     );
//     if (selectedPartData) {
//       setSelectedProcesses(selectedPartData.process_data);
//     } else {
//       setSelectedProcesses([]);
//     }

//     console.log("selectedPart", selectedPart);
//     console.log("selectedProcesses", selectedProcesses);
//   };


// const setIndividualPartNo = (partNo, stationId) => {
//     setIndSelPart(prevState => ({ ...prevState, [stationId]: partNo }));
//     // Filter the parts_data to get processes for the selected part
//     const partData = floorData.parts_data?.find(data => data.part_no === partNo);
//     if (partData) {
//       setIndSelProcess(prevState => ({
//         ...prevState,
//         [stationId]: partData.process_data || [],
//       }));
//       // Update selected process based on the newly selected part
//       const processNo = partData.process_data.length > 0
//         ? partData.process_data[0].process_no
//         : "";
//       setSelectedProcesses(prevState => ({ ...prevState, [stationId]: processNo }));
//     } else {
//       // If partData is not found, clear the selected process
//       setIndSelProcess(prevState => ({ ...prevState, [stationId]: [] }));
//       setSelectedProcesses(prevState => ({ ...prevState, [stationId]: "" }));
//     }
//     console.log("indSelPart",indSelPart)
//   };
  
//   const setIndividualProcess = (processNo, stationId) => {
//     setSelectedProcesses(prevState => ({ ...prevState, [stationId]: processNo }));
//     console.log("indSelProcess",indSelProcess)
//   };

  

//   // Function to update quantity for all stations
//   const setWholeQty = (e, lineNo) => {
//     const { value } = e.target;
//     const updatedQuantities = {};
  
//     // Iterate through all stations
//     Object.keys(stationQuantities).forEach((stationId) => {
//       // Extract line number from stationId
//       const stationLineNo = stationId.split(" ")[2]; // Assuming stationId format is "G01 F02 L01 S01"
//       // Check if the station belongs to the specified line number
//       if (stationLineNo === lineNo) {
//         updatedQuantities[stationId] = value;
//       }
//     });
//     setStationQuantities(updatedQuantities);
//     setQty(value);
//   };

//   // Function to update quantity for a particular station
//   const setIndividualStationQty = (e, stationId) => {
//     const { value } = e.target;
//     setStationQuantities({ ...stationQuantities, [stationId]: value });
//   };


//   class Task {
//     constructor(stationId, employeeId, partNo, processNo, startShiftTime, endShiftTime, assignedByOwner, totalAssignedTasks) {
//         this.station_id = stationId;
//         this.employee_id = employeeId || "";
//         this.part_no = partNo || "";
//         this.process_no = processNo || "";
//         this.start_shift_time = startShiftTime || "";
//         this.end_shift_time = endShiftTime || "";
//         this.assigned_by_owner = assignedByOwner || "";
//         this.total_assigned_task = totalAssignedTasks || 3;       
//     }
// }

// const logTaskData = () => {
//   const tasksArray = []; // Initialize an empty array to store task objects
//   // Loop through stations or any other source to gather task data
//   Object.keys(stationData).forEach((stationId) => {
//       const tasks = stationData[stationId];
//       tasks.forEach((task) => {
//           const newTask = {
//               station_id: stationId,
//               employee_id: task.employee_id || "",
//               part_no: indSelPart[stationId] || "",
//               process_no: selectedProcesses[stationId] || "",
//               start_shift_time: startShiftTime,
//               end_shift_time: endShiftTime,
//               shift: "A", // Assuming shift is hardcoded to "A" for now
//               assigned_by_owner: login.employee_id, // Assuming assigned_by_owner is hardcoded for now
//               total_assigned_task: task.total_assigned_task || 3,
//           };
//           tasksArray.push(newTask); // Push each task object to the tasksArray
//       });
//   });

//   console.log('Task Data:', tasksArray);
// };

  
//   function generateTimeOptions() {
//     const options = [];
//     for (let hour = 0; hour < 24; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const time = `${hour < 10 ? "0" + hour : hour}:${
//           minute === 0 ? "00" : minute
//         }`;
//         options.push(<option key={time}>{time}</option>);
//       }
//     }
//     return options;
//   }

//   const [startShiftTime, setStartShiftTime] = useState("");
//   const [endShiftTime, setEndShiftTime] = useState("");

//   // Function to handle change in start shift time
//   const handleStartShiftChange = (e) => {
//     setStartShiftTime(e.target.value);
//   };

//   // Function to handle change in end shift time
//   const handleEndShiftChange = (e) => {
//     setEndShiftTime(e.target.value);
//   };


//   return (
//     <>
//       <div>
//         <DashBoardAbove />
//       </div>

//       <div className="task__main">
//         <div className="task__head">
//           <div className="task_left_head">
//             <p className="task_left_view">View Running Task</p>
//             <button className="task_left_btn">View</button>
//           </div>

//           <div className="task_right_head">
//             <p className="task_right_view">Add Previous Task to Logs</p>
//             <button className="task_right_btn" onClick={logTaskData}>Add</button>
//           </div>
//         </div>
//         <hr />

//         <div className="task_buttons">
//           {Array.from({ length: totalLines }).map((_, index) => (
//             <button
//               key={index}
//               className={activeButton == index + 1 ? "active" : ""}
//               onClick={() => handleButtonClick(index + 1)}
//             >
//               Line {index + 1}
//             </button>
//           ))}
//         </div>

//         <div className="task_qty_section">
//           <div className="task__qty">
//             <p>Select Shift Timings</p>

//             <div className="update_dropdown">
//               <select onChange={handleStartShiftChange}>
//                 <option>Start </option>
//                 {generateTimeOptions()}
//               </select>
//             </div>

//             <div className="update_dropdown">
//               <select onChange={handleEndShiftChange}>
//                 <option>End </option>
//                 {generateTimeOptions()}
//               </select>
//             </div>

//             <p>Enter Quantity</p>
//             <input
//               className="task_qty_input"
//               value={qty}
//               onChange={setWholeQty}
//             />
//             <p>Or</p>
//             <button className="task_qty_btn">Fetch From Quantity</button>
//           </div>


//           <div className="task_dropdown">
//             {/* <p>Select Part Name:</p>
//                 {floorData.parts_data &&
//                   floorData.parts_data.map((data, idx) => (
//                     <option key={idx}>{data.part_no}</option>
//                   ))}
//               </select>
//             </div> */}
//           </div>
//         </div>

//         <div className="task_stations_container">
//           {Object.entries(stationData).map(([stationId, tasks]) => (
//             <div key={stationId} className="task_stations">
//               <div className="task_stations_left">
//                 <h4>{stationId}</h4>              
//                 <div className="task_stations_part">
//                   <p>
//                     Part:{" "}
//                     {tasks.length > 0 &&
//                     (!indSelPart.hasOwnProperty(stationId) ||
//                       indSelPart[stationId] == "")
//                       ? tasks[0].part_no || selectedPart
//                       : indSelPart[stationId]}
//                   </p>
//                 </div>
//                 <div className="task_stations_part">
//                   <p>
//                     Process:{" "}
//                     {(selectedProcesses[stationId] !== undefined &&
//                       selectedProcesses[stationId] !== "") ||
//                     (indSelProcess[stationId]?.[0]?.process_no !== undefined &&
//                       indSelProcess[stationId]?.[0]?.process_no !== "") ||
//                     (tasks && tasks.length > 0
//                       ? tasks[0].process_no !== ""
//                       : true)
//                       ? selectedProcesses[stationId] ||
//                         indSelProcess[stationId]?.[0]?.process_no ||
//                         (tasks && tasks.length > 0 ? tasks[0].process_no : "")
//                       : ""}
//                   </p>
//                 </div>
//                 <div className="task_stations_part">
//                   <p>
//                     Employee: {tasks.length > 0 ? tasks[0].employee_name : ""}
//                   </p>
//                 </div>
//               </div>

           
//               <div className="task_stations_right">
//                 <input
//                   className="task_station_input"
//                   value={stationQuantities[stationId] || ""}
//                   onChange={(e) => setIndividualStationQty(e, stationId)}
//                 />
//                 <div className="task_dropdown">
//                   <select
//                     onChange={(e) =>
//                       setIndividualPartNo(e.target.value, stationId)
//                     }
//                   >
//                     <option value="">Select</option>
//                     {floorData.parts_data &&
//                       floorData.parts_data.map((data, idx) => (
//                         <option key={idx}>{data.part_no}</option>
//                       ))}
//                   </select>
//                 </div>
//                 <div className="task_dropdown">
//                   <select
//                     onChange={(e) =>
//                       setIndividualProcess(e.target.value, stationId)
//                     }
//                   >
//                     <option value="">Select</option>
//                     {indSelProcess[stationId]?.map((process, idx) => (
//                       <option key={idx} value={process.process_no}>
//                         {process.process_no}
//                       </option>
//                     ))}
//                   </select>
//                 </div>{" "}
//                 <div className="task_dropdown">
//                   <select>
//                     <option value="">Change</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// }

// export default Task;



























































// import React, { startTransition, useEffect, useState } from "react";
// import "./Task.css";
// import DashBoardAbove from "../DashboardR/DashBoardAbove";
// import { useNavigate } from "react-router-dom";
// import useTokenExpirationCheck from "../useTokenExpirationCheck";
// import Line from "../Line/Line";

// function Task() {

//   const navigate = useNavigate();

//   const floorData = {
//     "All_stations": "{'G01 F02 L01': ['G01 F02 L01 S01', 'G01 F02 L01 S03', 'G01 F02 L01 S04', 'G01 F02 L01 S05', 'G01 F02 L01 S06'], 'G01 F02 L02': ['G01 F02 L02 S01', 'G01 F02 L02 S02', 'G01 F02 L02 S03', 'G01 F02 L02 S04']}",
//     "lines": "['G01 F02 L01', 'G01 F02 L02']",
//     "parts_data": [
//         {
//             "part_name": "",
//             "part_no": "IMO-12",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-17",
//             "process_data": [
//                 {
//                     "process_name": "mounting and hot sealing of connector's guide pins with PCB",
//                     "process_no": "IMO-17 PR300"
//                 },
//                 {
//                     "process_name": "Soldering of connector terminals with PCB by robotic soldring machine",
//                     "process_no": "IMO-17 PR301"
//                 },
//                 {
//                     "process_name": "Visual inspection of both side of PCB Assy. under Camera based TV monitor.",
//                     "process_no": "IMO-17 PR310"
//                 },
//                 {
//                     "process_name": "Voltage Check And IC Programming @ 13.5 v",
//                     "process_no": "IMO-17 PR320"
//                 },
//                 {
//                     "process_name": "Conformal coating on bottom side of PCB",
//                     "process_no": "IMO-17 PR340"
//                 },
//                 {
//                     "process_name": "Inspection of coil Assy & mounting of coil on PCB. Screw tightening by Robotic M/c then soldering of coil terminal with PCB",
//                     "process_no": "IMO-17 PR350"
//                 },
//                 {
//                     "process_name": "Testing-2 @ 13.5V. Soldering of capacitor selected for tuning",
//                     "process_no": "IMO-17 PR360"
//                 },
//                 {
//                     "process_name": "Programming of immo. For main application After that Automatic testing @ 13.5V and after that vibration testing on part",
//                     "process_no": "IMO-17 PR370"
//                 },
//                 {
//                     "process_name": "Conformal coating on top side of PCB",
//                     "process_no": "IMO-17 PR390"
//                 },
//                 {
//                     "process_name": "Visual inspection of top side of PCB Assy. After that Fixing of coil cover. Illumination ring and housing",
//                     "process_no": "IMO-17 PR410"
//                 },
//                 {
//                     "process_name": "Illumination ring checking by Camera based system only for W601 (IMO22)",
//                     "process_no": "IMO-17 PR411"
//                 },
//                 {
//                     "process_name": "Testing of illumination",
//                     "process_no": "IMO-17 PR420"
//                 },
//                 {
//                     "process_name": "Checking fitment of round cover and hole matching with key cylinder and final testing at 9V & 16V then barcode sticker pasting on part",
//                     "process_no": "IMO-17 PR430"
//                 },
//                 {
//                     "process_name": "Firewall - Autotesting testing & verification of previous check marks",
//                     "process_no": "IMO-17 PR440"
//                 }
//             ]
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-19",
//             "process_data": [
//                 {
//                     "process_name": "Hardware",
//                     "process_no": "7"
//                 }
//             ]
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-20",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-23",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-45",
//             "process_data": [
//                 {
//                     "process_name": "Coating",
//                     "process_no": "6"
//                 }
//             ]
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-50",
//             "process_data": []
//         },
//         {
//             "part_name": "",
//             "part_no": "IMO-8",
//             "process_data": []
//         }
//     ],
//     "station_data": {
//         "G01 F02 L01 S01": [],
//         "G01 F02 L01 S03": [],
//         "G01 F02 L01 S04": [
//             {
//                 "employee_id": "E04",
//                 "employee_name": "yogesh",
//                 "employee_skill_level": "3",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR301",
//                 "station_id": "G01 F02 L01 S04",
//                 "total_assigned_task": 300
//             }
//         ],      
//         "G01 F02 L02 S01": [
//             {
//                 "employee_id": "E07",
//                 "employee_name": "bhavna",
//                 "employee_skill_level": "4",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR304",
//                 "station_id": "G01 F02 L02 S01",
//                 "total_assigned_task": 300
//             }
//         ],
//         "G01 F02 L02 S02": [
//             {
//                 "employee_id": "E08",
//                 "employee_name": "mansi",
//                 "employee_skill_level": "6",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR305",
//                 "station_id": "G01 F02 L02 S02",
//                 "total_assigned_task": 300
//             }
//         ],
//         "G01 F02 L02 S03": [
//             {
//                 "employee_id": "E80",
//                 "employee_name": "harshit",
//                 "employee_skill_level": "7",
//                 "part_no": "IMO-17",
//                 "process_no": "IMO-17 PR325",
//                 "station_id": "G01 F02 L02 S03",
//                 "total_assigned_task": 300
//             }
//         ],
//         "G01 F02 L02 S04": []
//     },
//     "totalLines": "2"
// };


//   const token = JSON.parse(localStorage.getItem("Token"));
//   const login = JSON.parse(localStorage.getItem("Login"));
//   const floor_no = JSON.parse(localStorage.getItem("floor_no"));
//   const [lineNo, setLineNo] = useState("");
//   const totalLines = JSON.parse(localStorage.getItem("TotalLines"));
//   const [qty, setQty] = useState("");
//   const [stationQuantities, setStationQuantities] = useState({});

//   const [activeButton, setActiveButton] = useState();
//   const [stationData, setStationData] = useState({});

//   const handleButtonClick = (buttonNumber) => {
//     if (activeButton === buttonNumber) {
//       setActiveButton(null);
//       setLineNo("");
//       setStationData({});
//     } else {
//       setActiveButton(buttonNumber);
//     //   const lineKey = `${floor_no} L0${buttonNumber}`; // Assuming lineKey format
//     const lineKey = `${floor_no} L${buttonNumber > 9 ? buttonNumber : '0' + buttonNumber}`;
//       console.log("Selected Line Key:", lineKey);
//       setLineNo(lineKey);
//       // Extract station data for the selected line from the API response
//       // const stationsData = floorData.station_data[lineKey] || {};
//       const stationsData = Object.keys(floorData.station_data).reduce(
//         (acc, stationKey) => {
//           if (stationKey.startsWith(lineKey)) {
//             acc[stationKey] = floorData.station_data[stationKey];
//           }
//           return acc;
//         },
//         {}
//       );

//       console.log("Station Data:", stationsData);
//       setStationData(stationsData);
//     }
//   };


//   const [selectedPart, setSelectedPart] = useState("");
//   const [indSelPart, setIndSelPart] = useState("");
//   const [indSelProcess, setIndSelProcess] = useState([]);
//   const [selectedProcesses, setSelectedProcesses] = useState([]);

//   const handlePartChange = (partNo) => {
//     setSelectedPart(partNo);
//     // Filter the parts_data to get processes for the selected part
//     const selectedPartData = floorData.parts_data?.find(
//       (data) => data.part_no == partNo
//     );
//     if (selectedPartData) {
//       setSelectedProcesses(selectedPartData.process_data);
//     } else {
//       setSelectedProcesses([]);
//     }

//     console.log("selectedPart", selectedPart);
//     console.log("selectedProcesses", selectedProcesses);
//   };


// const setIndividualPartNo = (partNo, stationId) => {
//     setIndSelPart(prevState => ({ ...prevState, [stationId]: partNo }));
//     // Filter the parts_data to get processes for the selected part
//     const partData = floorData.parts_data?.find(data => data.part_no === partNo);
//     if (partData) {
//       setIndSelProcess(prevState => ({
//         ...prevState,
//         [stationId]: partData.process_data || [],
//       }));
//       // Update selected process based on the newly selected part
//       const processNo = partData.process_data.length > 0
//         ? partData.process_data[0].process_no
//         : "";
//       setSelectedProcesses(prevState => ({ ...prevState, [stationId]: processNo }));
//     } else {
//       // If partData is not found, clear the selected process
//       setIndSelProcess(prevState => ({ ...prevState, [stationId]: [] }));
//       setSelectedProcesses(prevState => ({ ...prevState, [stationId]: "" }));
//     }
//     console.log("indSelPart",indSelPart)
//   };
  
//   const setIndividualProcess = (processNo, stationId) => {
//     setSelectedProcesses(prevState => ({ ...prevState, [stationId]: processNo }));
//     console.log("indSelProcess",indSelProcess)
//   };

  

//   // Function to update quantity for all stations
//   const setWholeQty = (e, lineNo) => {
//     const { value } = e.target;
//     const updatedQuantities = {};
  
//     // Iterate through all stations
//     Object.keys(stationQuantities).forEach((stationId) => {
//       // Extract line number from stationId
//       const stationLineNo = stationId.split(" ")[2]; // Assuming stationId format is "G01 F02 L01 S01"
//       // Check if the station belongs to the specified line number
//       if (stationLineNo === lineNo) {
//         updatedQuantities[stationId] = value;
//       }
//     });
//     setStationQuantities(updatedQuantities);
//     setQty(value);
//   };

//   // Function to update quantity for a particular station
//   const setIndividualStationQty = (e, stationId) => {
//     const { value } = e.target;
//     setStationQuantities({ ...stationQuantities, [stationId]: value });
//   };


// //   class Task {
// //     constructor(stationId, employeeId, partNo, processNo, startShiftTime, endShiftTime, assignedByOwner, totalAssignedTasks) {
// //         this.station_id = stationId;
// //         this.employee_id = employeeId || "";
// //         this.part_no = partNo || "";
// //         this.process_no = processNo || "";
// //         this.start_shift_time = startShiftTime || "";
// //         this.end_shift_time = endShiftTime || "";
// //         this.assigned_by_owner = assignedByOwner || "";
// //         this.total_assigned_task = totalAssignedTasks || 3;       
// //     }
// // }

// const logTaskData = () => {
//   const tasksArray = []; // Initialize an empty array to store task objects
//   // Loop through stations or any other source to gather task data
//   Object.keys(stationData).forEach((stationId) => {
//       const tasks = stationData[stationId];
//       tasks.forEach((task) => {
//           const newTask = {
//               station_id: stationId,
//               employee_id: task.employee_id || "",
//               part_no: indSelPart[stationId] || "",
//               process_no: selectedProcesses[stationId] || "",
//               start_shift_time: startShiftTime,
//               end_shift_time: endShiftTime,
//               shift: "A", // Assuming shift is hardcoded to "A" for now
//               assigned_by_owner: login.employee_id, // Assuming assigned_by_owner is hardcoded for now
//               total_assigned_task: task.total_assigned_task || 3,
//           };
//           tasksArray.push(newTask); // Push each task object to the tasksArray
//       });
//   });

//   console.log('Task Data:', tasksArray);
// };

  
//   function generateTimeOptions() {
//     const options = [];
//     for (let hour = 0; hour < 24; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const time = `${hour < 10 ? "0" + hour : hour}:${
//           minute === 0 ? "00" : minute
//         }`;
//         options.push(<option key={time}>{time}</option>);
//       }
//     }
//     return options;
//   }

//   const [startShiftTime, setStartShiftTime] = useState("");
//   const [endShiftTime, setEndShiftTime] = useState("");

//   // Function to handle change in start shift time
//   const handleStartShiftChange = (e) => {
//     setStartShiftTime(e.target.value);
//   };

//   // Function to handle change in end shift time
//   const handleEndShiftChange = (e) => {
//     setEndShiftTime(e.target.value);
//   };


//   return (
//     <>
//       <div>
//         <DashBoardAbove />
//       </div>

//       <div className="task__main">
//         <div className="task__head">
//           <div className="task_left_head">
//             <p className="task_left_view">View Running Task</p>
//             <button className="task_left_btn">View</button>
//           </div>

//           <div className="task_right_head">
//             <p className="task_right_view">Add Previous Task to Logs</p>
//             <button className="task_right_btn" onClick={logTaskData}>Add</button>
//           </div>
//         </div>
//         <hr />

//         <div className="task_buttons">
//           {Array.from({ length: totalLines }).map((_, index) => (
//             <button
//               key={index}
//               className={activeButton == index + 1 ? "active" : ""}
//               onClick={() => handleButtonClick(index + 1)}
//             >
//               Line {index + 1}
//             </button>
//           ))}
//         </div>

//         <div className="task_qty_section">
//           <div className="task__qty">
//             <p>Select Shift Timings</p>

//             <div className="update_dropdown">
//               <select onChange={handleStartShiftChange}>
//                 <option>Start </option>
//                 {generateTimeOptions()}
//               </select>
//             </div>

//             <div className="update_dropdown">
//               <select onChange={handleEndShiftChange}>
//                 <option>End </option>
//                 {generateTimeOptions()}
//               </select>
//             </div>

//             <p>Enter Quantity</p>
//             <input
//               className="task_qty_input"
//               value={qty}
//               onChange={setWholeQty}
//             />
//             <p>Or</p>
//             <button className="task_qty_btn">Fetch From Quantity</button>
//           </div>


//           <div className="task_dropdown">
//             {/* <p>Select Part Name:</p>
//                 {floorData.parts_data &&
//                   floorData.parts_data.map((data, idx) => (
//                     <option key={idx}>{data.part_no}</option>
//                   ))}
//               </select>
//             </div> */}
//           </div>
//         </div>

//         <div className="task_stations_container">
//           {Object.entries(stationData).map(([stationId, tasks]) => (
//             <div key={stationId} className="task_stations">
//               <div className="task_stations_left">
//                 <h4>{stationId}</h4>              
//                 <div className="task_stations_part">
//                   <p>
//                     Part:{" "}
//                     {tasks.length > 0 &&
//                     (!indSelPart.hasOwnProperty(stationId) ||
//                       indSelPart[stationId] == "")
//                       ? tasks[0].part_no || selectedPart
//                       : indSelPart[stationId]}
//                   </p>
//                 </div>
//                 <div className="task_stations_part">
//                   <p>
//                     Process:{" "}
//                     {(selectedProcesses[stationId] !== undefined &&
//                       selectedProcesses[stationId] !== "") ||
//                     (indSelProcess[stationId]?.[0]?.process_no !== undefined &&
//                       indSelProcess[stationId]?.[0]?.process_no !== "") ||
//                     (tasks && tasks.length > 0
//                       ? tasks[0].process_no !== ""
//                       : true)
//                       ? selectedProcesses[stationId] ||
//                         indSelProcess[stationId]?.[0]?.process_no ||
//                         (tasks && tasks.length > 0 ? tasks[0].process_no : "")
//                       : ""}
//                   </p>
//                 </div>
//                 <div className="task_stations_part">
//                   <p>
//                     Employee: {tasks.length > 0 ? tasks[0].employee_name : ""}
//                   </p>
//                 </div>
//               </div>

           
//               <div className="task_stations_right">
//                 <input
//                   className="task_station_input"
//                   value={stationQuantities[stationId] || ""}
//                   onChange={(e) => setIndividualStationQty(e, stationId)}
//                 />
//                 <div className="task_dropdown">
//                   <select
//                     onChange={(e) =>
//                       setIndividualPartNo(e.target.value, stationId)
//                     }
//                   >
//                     <option value="">Select</option>
//                     {floorData.parts_data &&
//                       floorData.parts_data.map((data, idx) => (
//                         <option key={idx}>{data.part_no}</option>
//                       ))}
//                   </select>
//                 </div>
//                 <div className="task_dropdown">
//                   <select
//                     onChange={(e) =>
//                       setIndividualProcess(e.target.value, stationId)
//                     }
//                   >
//                     <option value="">Select</option>
//                     {indSelProcess[stationId]?.map((process, idx) => (
//                       <option key={idx} value={process.process_no}>
//                         {process.process_no}
//                       </option>
//                     ))}
//                   </select>
//                 </div>{" "}
//                 <div className="task_dropdown">
//                   <select>
//                     <option value="">Change</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// }

// export default Task;