import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Line from "../Line/Line";
import Operator from "../Operator/Operator";
import DashboardR from "../DashboardR/DashboardR";
// import { useUser } from "../../UserContext";
import { useNavigate } from "react-router-dom";
// import socketIOClient from "socket.io-client";
import io from "socket.io-client";
import { FaChartLine } from "react-icons/fa";
import { io as socketIOClient } from "socket.io-client";
import WebSocket from "websocket";

export default function Dashboard() {
  const [firstEffectCompleted, setFirstEffectCompleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Step 1: State variable for modal visibility
  const [selectedStation, setSelectedStation] = useState(null); // State to track the selected station
  const [workModalData, setWorkModalData] = useState({});
  const [stationid, setStationid] = useState("");
  const [modal1, setModal1] = useState(false);

  //MY VARIABLES
  const [arr, setArr] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [line, setLine] = useState(0);

  const [stations, setStations] = useState(0);

  const currentDate = new Date();

  // Get the date components
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();


  return (
<>
<DashboardR/>
</>
  );
}
