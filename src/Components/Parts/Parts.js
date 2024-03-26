import React, { useEffect, useRef, useState } from "react";
import './Parts.css';
import DashboardR from "../DashboardR/DashboardR";

function Parts() {
    const [showMsg, setShowMsg]=useState(false);

    const popUpRef=useRef()

    const [partId, setPartId] = useState('');
    const [partName, setPartName] = useState('');
    const [error, setError] = useState('');
const token = JSON.parse(localStorage.getItem("Token"));
const login = JSON.parse(localStorage.getItem("Login"))

useEffect(() => {
    const handleClickOutside = (event) => {
      if (popUpRef.current && !popUpRef.current.contains(event.target)) {
        setShowMsg(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


    const Add_part = async (e) => {
        e.preventDefault();
        const link = process.env.REACT_APP_BASE_URL;
        console.log('Base URL:', link);
        const endPoint = '/floorincharge/add_part';
        const fullLink = link + endPoint;

        try {
            const params = new URLSearchParams();
            params.append("part_name", partName);
            params.append("part_id", partId);
            params.append("added_by_owner",login.employee_id );

            const response = await fetch(fullLink, {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setShowMsg(true)
                // Handle successful response here
                console.log('Part added successfully!');
            } else {
                // Handle error response here
                console.error('Failed to add part');
                setError("Failed to add part");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An unexpected error occurred");
        }
    };

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
                    <p>Enter Part Id:<input placeholder="Part Id" value={partId} onChange={(e) => setPartId(e.target.value)} required/></p>
                    <p>Enter Part Name:<input placeholder="Part Name" value={partName} onChange={(e) => setPartName(e.target.value)} required/></p>
                </div>

                <div className="parts_add">
                    <button onClick={Add_part}>ADD</button>
                </div>

                <div className="parts_err"><p>{error}</p></div>
            </div>

            {showMsg && (
        <div ref={popUpRef} className="parts_popup">
          <p>Part Added Successfully!</p>
        </div>
      )}
        </div>
    );
}

export default Parts;
