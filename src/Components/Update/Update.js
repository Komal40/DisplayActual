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

export default function Update() {
  const navigate=useNavigate()

  const [showModel, setShowModel] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [arr, setArr] = useState([]);
  const [line, setLine] = useState(0)
  const [localLineNum, setLocalLineNum] = useState();
  const [selectedPartId, setSelectedPartId] = useState(null);
  const {totalLines}=useUser()
 
  const token = JSON.parse(localStorage.getItem("Token"));
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
        <AddStation showModal={showModel} closeModal={closeModel} />
      </div>

    </>
  );
}


