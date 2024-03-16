import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
// import { useUser } from "../../UserContext";
import { IoNotificationsOutline } from "react-icons/io5";
import { useState } from "react";
import { useUser } from "../../UserContext";

export default function DashBoardAbove() {
  const [currentTime, setCurrentTime] = useState(new Date());
  // const userData=localStorage.getItem('userData')
  const {userData}=useUser()

  useEffect(() => {
    // Update the current time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const formattedDateTie = currentTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  
  const formattedDateTime = () => {
    const suffixes = ["st", "nd", "rd"];
    const currentDate = new Date();
  
    // Get the date components
    const day = currentDate.getDate();
    const monthName = currentDate.toLocaleString("en-US", { month: "short" });
    const year = currentDate.getFullYear();
  
    // Get the time components
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
  
    // Get the suffix for the day
    let daySuffix = "th";
    if (day >= 1 && day <= 3) {
      daySuffix = suffixes[day - 1] || "th";
    }
  
    // Format the date and time string
    const formattedDate = `${day}${daySuffix} ${monthName} ${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;
  
    return `${formattedDate} : ${formattedTime}`;
  };
  

  


  return (
    <div>
      <div className="dashboard_container">
        <div className="dashboard_navbar">
          <div>
            <p className="dashboard_content">
              Name: <h4>
              {userData.fName} {userData.lName}
                </h4>
            </p>
          </div>
          {/* <div>
            <p className="dashboard_content">
              Device Id: <h4>{}</h4>
            </p>
          </div> */}
          <div>
            <p className="dashboard_content">
              User Id:<h4></h4>
            </p>
          </div>
          <div>
            <p className="dashboard_content">{formattedDateTime()}</p>
          </div>
          <div className="dashboard_content">
            <IoNotificationsOutline className="bell" />
          </div>
        </div>
      </div>
    </div>
  );
}
