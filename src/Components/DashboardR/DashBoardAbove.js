
import React, { useState, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import "./DashboardAbove.css";

const DashBoardAbove = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userData = JSON.parse(localStorage.getItem("Login"));
  const token = JSON.parse(localStorage.getItem("Token"));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

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
      let daySuffix = "th";
    if (day >= 1 && day <= 3) {
      daySuffix = suffixes[day - 1] || "th";
    }

    const formattedDate = `${day}${daySuffix} ${monthName} ${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // return currentDate.toLocaleString("en-US", {
    //   hour: "numeric",
    //   minute: "numeric",   
    //   second: "numeric",
    //   hour12: true,
    // });
    return `${formattedDate} : ${formattedTime}`;
    
  }; 

  const handleShowNotifications = async () => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/get_notifications";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("floor_no", userData?.floor_no);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.Notifications);
        setShowModal(true);
      } else {
        console.error("Failed to fetch notifications", response.status);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    const link = process.env.REACT_APP_BASE_URL;
    const endPoint = "/floorincharge/delete_notification";
    const fullLink = link + endPoint;

    try {
      const params = new URLSearchParams();
      params.append("notification_id", id);

      const response = await fetch(fullLink, {
        method: "POST",
        body: params,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedNotifications = notifications.filter((notification) => notification.notification_id !== id);
        setNotifications(updatedNotifications);
      } else {
        console.error("Failed to delete notification", response.status);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="dashboard_container">
      <div className="dashboard_navbar">
        <div>
          <p className="dashboard_content">
            Name: <h4>{userData ? `${userData.fName} ${userData.lName}` : "Loading..."}</h4>
          </p>
        </div>
        <div>
          <p className="dashboard_content">
            User Id: <h4>{userData ? userData.employee_id : ""}</h4>
          </p>
        </div>
        <div className="date_time">
          <p className="dashboard_content">{formattedDateTime()}</p>
        </div>
        <div className="dashboard_content">
          <IoNotificationsOutline className="notify_bell" onClick={handleShowNotifications} />
        </div>
      </div>
      {showModal && (
        <div className="notify_modal">
          <div className="notify_modal-content">
            <span className="notify_close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h2>Notifications</h2>
            <ul className="notification-list">
              {notifications.map((notification, index) => (
                <li key={notification.notification_id} className="notification-item">
                  <p>
                    <span>{`${index + 1}. ${notification.csp_name} at ${notification.station_id}, created at ${notification.created_time} on ${notification.created_date}`}</span>
                    <button className="delete-button" onClick={() => handleDeleteNotification(notification.notification_id)}>
                      &times;
                    </button>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoardAbove;
