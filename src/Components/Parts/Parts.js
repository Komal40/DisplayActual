import React from "react";
import './Parts.css'
import DashboardR from "../DashboardR/DashboardR";

function Parts() {
  return (
    <div>
      <div>
        <DashboardR />
      </div>

      <div className="parts_container">
        <div className="parts_heading">
        <p>Enter Part Name and Id and Click Add Button</p>
        </div>

        <div className="parts_details">
            <p>Enter Part Id:<input placeholder="Part Id"/></p>
            <p>Enter Part Name:<input placeholder="Part Name"/></p>
        </div>

        <div className="parts_add">
            <button>ADD</button>
        </div>

        <div className="parts_err"><p>Error Message:</p></div>
      </div>
    </div>
  );
}

export default Parts;
