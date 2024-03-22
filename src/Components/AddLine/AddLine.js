import React, { useEffect, useState } from 'react'
import './AddLine.css'
import { FaPlus } from "react-icons/fa6";
import { FaRegSave } from "react-icons/fa";
import { PiPlusBold } from "react-icons/pi";
import { RiSubtractLine } from "react-icons/ri";
import { useUser } from '../../UserContext';


export default function AddLine({showModal, closeModal}) {

    const [count, setCount] = useState(0);
    const {portNum}=useUser()
    const {portLength} = useUser()

    const subCount = () => {
      if (count == 0) return;
      setCount((prevCount) => prevCount - 1);
    };
  
    const addCount = () => {
      setCount((prevCount) => prevCount + 1);
    };




  return (
    <div className={`modal ${showModal ? "show" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        
        <div>
          <div>
            <p>
              <h4>Add New Line</h4>
            </p>
          </div>
          <div className="dashboard_content_leftline"></div>
        </div>


       <div className='changeport__container'>

       <div className="change_port_num">
            <select>
              <option>Port Number</option>
              {Array.from({ length:portLength}, (_, index) => (
                <option key={index + 1} value={`Line ${index + 1}`}>{portNum[index].part_name}</option>
              ))}
            </select>
          </div>       
       </div>
      </div>



      <div className="addStationsBtnLine">
        <button className="addstationcancelbtn">
            Cancel
        </button>
        <div className="update__btn">
            <FaRegSave className="update_regsave" />
            <span>
              <button>Update</button>
            </span>
      </div>
    </div>
    </div>
  )
}
