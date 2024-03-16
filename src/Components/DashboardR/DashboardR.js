import React, { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import DashBoardBelow from "./DashBoardBelow";
import DashBoardAbove from "./DashBoardAbove";

export default function DashboardR() {
  return (
    <div>
      <DashBoardAbove />
      <DashBoardBelow />
    </div>
  );
}


