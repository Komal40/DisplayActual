import React from "react";
import "./Parameters.css";
import DashboardR from "../DashboardR/DashboardR";

function Parameters() {
  return (
    <div>
      <div>
        <DashboardR />
      </div>

      <div className="parameters_container">
        <div className="parameters_head">
          <div className="process_head">
            <p>Select Part Name:</p>
            <div className="update_dropdown">
              <select>
                <option>Select </option>
              </select>
            </div>
          </div>

          <div className="process_head">
            <p>Select Process Name:</p>
            <div className="update_dropdown">
              <select>
                <option>Select </option>
              </select>
            </div>
          </div>
        </div>


        <div className="parts_details">
            <p>Enter Parameter Name:<input placeholder="Process Name"/></p>
            <p>Enter Minimum:<input placeholder="Maximum"/></p>
            <p>Enter Maximum:<input placeholder="Minimum"/></p>
            <p>Enter Unit:<input placeholder="Unit"/></p>
        </div>
      </div>
    </div>
  );
}

export default Parameters;
