import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { useState } from "react";
import "./DashboardAbove.css";

import { useUser } from "../../UserContext";

export default function DashBoardAbove() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const userDataString = localStorage.getItem("Login");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const [notify, setNotify] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const token = JSON.parse(localStorage.getItem("Token"));
  const login = JSON.parse(localStorage.getItem("Login"));

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

  
  const showNotification = async (e) => {
    e.preventDefault();
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_notifications";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("floor_no", login.floor_no);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowModal(true);

        const data = await response.json();
        console.log(data);
        setNotify(data.Notifications);
        console.log("get notification", notify);
      } else {
        console.error("Failed to fetch parts", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div className="dashboard_container">
        <div className="dashboard_navbar">
          <div>
            <p className="dashboard_content">
              Name :{" "}
              <h4>
                {userData
                  ? `${userData.fName} ${userData.lName}`
                  : "Loading..."}
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
              User Id :<h4>{userData?userData.employee_id:""}</h4>
            </p>
          </div>
          <div className="date_time">
            <p className="dashboard_content">{formattedDateTime()}</p>
          </div>
          <div className="dashboard_content">
            <IoNotificationsOutline
              className="notify_bell"
              onClick={showNotification}
            />
          </div>
        </div>
        {showModal && (
          <NotificationModal
            notifications={notify}
            closeModal={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}

const NotificationModal = ({ notifications, closeModal }) => {
  return (
    <div className="notify_modal">
      <div className="notify_modal-content">
        <span className="notify_close" onClick={closeModal}>
          &times;
        </span>
        <h2>Notification</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>
              <p>{`${index + 1}. ${notification.csp_name} at ${
                notification.station_id
              }, created at ${notification.created_at}`}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
