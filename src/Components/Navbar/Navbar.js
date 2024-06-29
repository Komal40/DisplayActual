import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import inter from '../Images/interface.png'


export default function Navbar() {
  const [closeMenu, setCloseMenu] = useState(false);
  const [showFloorOptions, setShowFloorOptions] = useState(false);
  const [showHistoryOptions, setShowHistoryOptions] = useState(false);

  const [showUpdateOptions, setShowUpdateOptions] = useState(false);

  
  const handleClick = () => {
    setCloseMenu(closeMenu);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("Login");
    localStorage.removeItem("Token");
    localStorage.removeItem("floor_no");
    localStorage.removeItem("TotalLines");
    localStorage.removeItem("stationData")
    localStorage.removeItem("approvedNotifications")
    // Navigate to the login page
    navigate("/");
  };

  const handleFloorClick = () => {
    setShowFloorOptions(!showFloorOptions);
    setShowUpdateOptions(false); // Close the update options when clicking on floor
  };

  const handleHistoryClick=()=>{
    setShowHistoryOptions(!showHistoryOptions)
  }

  const handleUpdateClick = () => {
    setShowUpdateOptions(!showUpdateOptions);
    setShowFloorOptions(false); // Close the floor options when clicking on update
  };

  return (
    <>
      <div>
        <nav className={closeMenu ? "nav_active" : "navbar"}>
          <div className={closeMenu ? "nav_arrow_active" : "nav_arrow"}>
          <img className='interface_logo' src={inter}/>

            <h2>

              {/* INTERFACE */}
              {/* <span><FaArrowLeft onClick={()=>handleClick()}/></span> */}
            </h2>
          </div>
          <div>
            <FaArrowRight
              onClick={() => handleClick()}
              className={closeMenu ? "right_arrow_active" : "right_arrow"}
            />
            <FaArrowRight
              onClick={handleUpdateClick}
              className={
                showUpdateOptions ? "right_arrow_active" : "right_arrow"
              }
            />
          </div>
          <div
            className={
              closeMenu ? "content_container_active" : "content_container"
            }
          >
            <ul>
              <li>
                <HashLink to="/app" className="dashboard_items">
                  DASHBOARD
                </HashLink>
              </li>
              {/* <li><HashLink to='/update' className='dashboard_items'>UPDATE FLOOR</HashLink></li>
            <li><HashLink to='/assign' className='dashboard_items'> ASSIGN PARTS</HashLink></li> */}
              <li className="dropdown">
                <span className="dashboard_items" onClick={handleFloorClick}>
                  UPDATE FLOOR
                </span>
                {showFloorOptions && (
                  <div className="dropdown-menu">
                    <li>
                      <HashLink to="/update" className="dashboard_items">
                        LINES
                      </HashLink>
                    </li>
                    <li>
                      <HashLink to="/parts" className="dashboard_items">
                        PARTS
                      </HashLink>
                    </li>
                    <li>
                      <HashLink to="/process" className="dashboard_items">
                        PROCESS
                      </HashLink>
                    </li>
                    <li>
                      <HashLink to="/para" className="dashboard_items">
                        PARAMETERS
                      </HashLink>
                    </li>
                   
                  </div>
                )}
              </li>
              {/* <li><HashLink to='/prevdata' className='dashboard_items'>Previous Data</HashLink></li> */}

              <li>
                <HashLink to="/delete" className="dashboard_items">
                  DELETE FLOOR
                </HashLink>
              </li>
              
              <li>
                <HashLink to="/register" className="dashboard_items">
                  ADD OPERATOR
                </HashLink>
              </li>
              <li>
                <HashLink to="/task" className="dashboard_items">
                 TASK
                </HashLink>
              </li>

              {/* <li>
                <HashLink to="/updateTask" className="dashboard_items">
                 UPDATES TASK
                </HashLink>
              </li> */}


              <li>
                      <HashLink to="/assignopt" className="dashboard_items">
                        UPDATE OPERATOR
                      </HashLink>
                    </li>
              <li>
                <HashLink className="dashboard_items" to="/chart">
                  GENERATE CHART
                </HashLink>
              </li>

              {/* <li>
                <HashLink className="dashboard_items" to="/history">
                  HISTORY
                </HashLink>
              </li> */}
                <li className="dropdown">
                <span className="dashboard_items" onClick={handleHistoryClick}>
                  HISTORY
                </span>
                {showHistoryOptions && (
                  <div className="dropdown-menu">
                    <li>
                      <HashLink to="/history" className="dashboard_items">
                        FPA Failed History 
                      </HashLink>
                    </li>
                    <li>
                      <HashLink to="/itemsHistory" className="dashboard_items">
                        FPA Failed Items
                      </HashLink>
                    </li>
                  </div>
                )}
              </li>
              {/* <li>
                <HashLink className="dashboard_items">ACCOUNT</HashLink>
              </li> */}
              <hr style={{ width: "100%" }} />
              <li onClick={handleLogout}>
                <HashLink className="dashboard_items">LOG OUT</HashLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}
