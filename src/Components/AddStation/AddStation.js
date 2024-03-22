// AddStationModal.js
import "./AddStation.css";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { RiSubtractLine } from "react-icons/ri";
import { FaRegSave } from "react-icons/fa";
import { useUser } from "../../UserContext";
import { FiLogIn } from "react-icons/fi";
import Login from "../Login/Login";

const AddStationModal = ({ showModal, closeModal }) => {
  const [count, setCount] = useState(1);
  const [stationnum, setStationNum] = useState();
const floor_no=JSON.parse(localStorage.getItem("floor_no"))

  const [selectedMornEmployee, setSelectedMornEmployee] = useState("");
  const [selectedEveEmployee, setSelectedEveEmployee] = useState("");
  const [selectProcess, setSelectedProcess] = useState("");
  const [mornValue, setMornValue] = useState("");
  const [eveValue, setEveValue] = useState("");
  const [skill, setSkill] = useState("");

  const [mornName, setMornName]=useState("");
  const [eveName, setEveName]=useState("")
  const [empSkill, setEmpSkill]=useState("")
  // const [idLen, setIdLen]=useState(stationLine)
  const [stationid, setStationid] = useState();
  const [arr, setArr] = useState([]);

  const getData = (e) => {
    // setStationNum(stationnum);
  };

  const cancel=()=>{
    setSelectedMornEmployee("");
    setSelectedEveEmployee("");
    setSelectedProcess("");
    setMornValue("");
    setEveValue("");
    setSkill("");
    setMornName("");
    setEveName("");
    setEmpSkill("");
  }


  const closeAndClearModal = () => {
    // Reset all state variables to their initial values
    setCount(1);
    setStationNum("");
    setSelectedMornEmployee("");
    setSelectedEveEmployee("");
    setSelectedProcess("");
    setMornValue("");
    setEveValue("");
    setSkill("");
    setMornName("");
    setEveName("");
    setEmpSkill("");

    // Close the modal
    closeModal();
  };



  const subCount = () => {
    if (count == 1) return;
    setCount((prevCount) => prevCount - 1);
  };

  const addCount = () => {
    if (count == 10) return;
    setCount((prevCount) => prevCount + 1);
  };

  const generateDivs = () => {
    const divs=[]
    
    for (let i = 0; i < count; i++) {
      const currentStationId = divs[i] ||  1;
      divs.push(
        <div className="addStations" key={i}>
          <div className="addstation_component">
            {/* <p className="addStaionName"></p> */}
            <p>Station Code:</p>
            <p>Line Code:</p>
            <p>Floor No: {floor_no}</p>
            <p>Building Code: {floor_no.split(" ")[0]}</p>

            
            </div>          
          </div>      
      );
    }
    return divs;
  };

  return (
    <div className={`modal ${showModal ? "show" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={closeAndClearModal}>
          &times;
        </span>
        <div>
          <div>
            <p>
              <h4>Add New Station</h4>
            </p>
          </div>
          <div className="dashboard_content_leftline"></div>
        </div>

        <div className="addnostation">
          <p>Number of Stations </p>
          <div>
            <RiSubtractLine className="subSign" onClick={() => subCount()} />
          </div>
          <div className={`count_var ${count > 0 ? "active" : ""}`}>
            {count}
          </div>
         
          <div>
            <FaPlus className="subSign" onClick={() => addCount()} />
          </div>
        </div>

        <div className="addStation_container">{generateDivs()}</div>

        <div>
          <p>Error Message</p>
        </div>
      </div>

      <div className="addStationsBtn">
        <button className="addstationcancelbtn" onClick={cancel}>Cancel</button>
        <div className="update__btn">
          <FaRegSave className="update_regsave" />
          <span>
            <button>Update</button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddStationModal;
