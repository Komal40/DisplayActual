import React, { useState } from "react";
import "./Update.css";
import Navbar from "../Navbar/Navbar";
import Dashboard from "../Dashboard/Dashboard";
import DashboardR from "../DashboardR/DashboardR";
import { FaPlus } from "react-icons/fa6";
import { FaRegSave } from "react-icons/fa";
import UpdateComp from "./UpdateComp";
import { PiPlusBold } from "react-icons/pi";
import AddStation from "../AddStation/AddStation";
import AddLine from "../AddLine/AddLine";
import { TbReload } from "react-icons/tb";
import { FiTrash } from "react-icons/fi";
import { useEffect } from "react";
import { useUser } from "../../UserContext";
import useTokenExpirationCheck from "../useTokenExpirationCheck";
import { useNavigate } from "react-router-dom";
import AddStationsOnLine from "../AddStationsOnLine/AddStationsOnLine";

export default function Update() {
  const navigate = useNavigate();

  const [showModel, setShowModel] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [arr, setArr] = useState([]);
  const [line, setLine] = useState(0);
  const [localLineNum, setLocalLineNum] = useState();
  const [selectedPartId, setSelectedPartId] = useState(null);
  // const {totalLines}=useUser()
  const totalLines = localStorage.getItem("TotalLines");
  const [stationData, setStationData] = useState({});
  const token = JSON.parse(localStorage.getItem("Token"))
  const floor_no = JSON.parse(localStorage.getItem("floor_no"));
  const tokenExpired = useTokenExpirationCheck(token, navigate);


  const openModal = () => {
    setShowModel(true);
  };

  const closeModel = () => {
    setShowModel(false);
  };

  const handlePartChange = (event) => {
    const selectedOption = event.target.value;
    setSelectedPartId(selectedOption); // Set the selected part_id in state
    console.log("Selected Part ID:", selectedOption);
  };

  const addStation = () => {
    setShowModel(true);
    // fetch api of getting getlogin process
  };

  const addLine = () => {
    setShowLine(true);
  };

  const closeLine = () => {
    setShowLine(false);
  };


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
          // getTotalLines(totalLines);

          setStationData({
            stations: stations,
            lines: lines,
            totalLines: totalLines,
          });

          console.log("object set station on add station data", stationData);
        } else {
          const errorData = await response.text();
          console.error("API Error:", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [token]);

  // const initialSelectedLine = selectedLine || "L01";
  const [selectedLine, setselectedLine]=useState("")
    const generateLineButtons = () => {
    return (
      stationData.lines &&
      stationData.lines
        .sort((a, b) => {
          // Extract the line numbers from the line names
          const lineA = parseInt(a.split("L")[1]);
          const lineB = parseInt(b.split("L")[1]);
          // Compare the line numbers
          return lineA - lineB;
        })

        .map((line, index) => (
          <option key={index}>
            {/* {`Line ${parseInt(line.split("L")[1])}`} */}
            {line}
          </option>
        ))
    );
    
  };

  const handleLineChange=(e)=>{
    // G01 F02 L02
    console.log(e)
    // const lineCode = e.split(" ")[2][2]
    // const stationCount=stationData.lines[e].length();
    if (stationData.lines) {
      const stationCount = stationData.stations[e].length;
      console.log("Station Count:", stationCount);
    }   
    setselectedLine(e)
  }

  
  return (
    <>
      <div>
        <Navbar />
      </div>
      <div>
        <DashboardR />
      </div>

      <div className="update_main">
        <div className="updates__cont">
          <div className="update_linecontainer">
            <div className="update_dropdown">
              <h3>Number Of Lines:{totalLines}</h3>
            </div>

            <div className="update__btn">
              <span>
                <button onClick={openModal}>Add New Line</button>
              </span>
            </div>
          </div>
        </div>

        {/* <AddLine showModal={showLine} closeModal={closeLine} /> */}
        <AddStation
          showModal={showModel}
          closeModal={closeModel}
          totalLines={totalLines}
        />

        <div className="updates__cont">
          <div className="update_linecontainer">
          <div className="update_dropdown">
              <select onClick={(e) => handleLineChange(e.target.value)}>
                <option disabled>Select</option>
                {generateLineButtons()}
              </select>
            </div>
           

            <div className="update__btn">
              <span>
                <button onClick={addLine}>Add New Station</button>
              </span>
            </div>
          </div>
          
        </div>

        <AddStationsOnLine
        showModal={showLine}
        closeModal={closeLine}
        selectedLine={selectedLine}       
        stationData={stationData}/>
      </div>
    </>
  );
}
