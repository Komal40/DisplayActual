import "./App.css";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Login from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import Register from "./Components/Register/Register";
import Update from "./Components/Update/Update";
import Parts from "./Components/Parts/Parts";
import Process from "./Components/Process/Process";
import Parameters from "./Components/Parameters/Parameters";
import Task from "./Components/Task/Task";
import TaskNew from "./Components/TaskNew/TaskNew";
import Chart from "./Components/Chart/Chart";
import withScreenSizeCheck from "./WithScreenSizeCheck";
import DeleteFloor from "./Components/DeleteFloor/DeleteFloor";
import AssignOperator from "./Components/AssignOperator/AssignOperator";
import TaskPrac from "./Components/TaskPrac/TaskPrac";
import StationList from "./Components/TaskPrac/StationList";
import UpdatedTask from "./Components/UpdatedTask/UpdatedTask";
import History from "./Components/History/History";
import AdminLogin from './SuperAdmin/Login/AdminLogin'

import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { UserProvider } from "./UserContext";
import TaskPrac2 from "./Components/TaskPrac/TaskPrac2";
import Fpa_FailedItems from "./Components/History/Fpa_FailedItems";
import LineHistory from "./Components/History/LineHistory";
import AddFixedTask from "./Components/TaskPrac/AddFixedTask";

const FallbackComponent = ({ error, resetErrorBoundary }) => (
  <div style={{ marginLeft: "20rem", marginTop: "4rem" }}>
    {/* <p>{error.message}</p> */}
    <h3>Something Went Wrong...</h3>
    <button className="task_assign_btn" onClick={resetErrorBoundary}>
      Try again
    </button>
  </div>
);

function MainApp() {
  const location = useLocation();
  const shouldShowNavbar = location.pathname !== "/";

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <UserProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute Component={Login} />} />
            <Route
              path="/register"
              element={<ProtectedRoute Component={Register} />}
            />
            <Route
              path="/app"
              element={<ProtectedRoute Component={Dashboard} />}
            />
            <Route
              path="/update"
              element={<ProtectedRoute Component={Update} />}
            />
            <Route
              path="/parts"
              element={<ProtectedRoute Component={Parts} />}
            />
            <Route
              path="/process"
              element={<ProtectedRoute Component={Process} />}
            />
            <Route
              path="/para"
              element={<ProtectedRoute Component={Parameters} />}
            />

            {/* <Route
          path="/task"
          element={<ProtectedRoute Component={TaskPrac} />}
        /> */}
            <Route
              path="/task"
              element={<ProtectedRoute Component={StationList} />}
            />
            <Route
              path="/customize"
              element={<ProtectedRoute Component={TaskPrac} />}
            />
            <Route
              path="/global"
              element={<ProtectedRoute Component={TaskPrac2} />}
            />
            <Route path='/taskData' element={<ProtectedRoute Component={AddFixedTask}/>}/>
            {/* <Route path='/task' element={<ProtectedRoute Component={TaskNew}/>}/> */}
            {/* <Route path='/updateTask' element={<UpdatedTask/>}/>  */}
            <Route
              path="/chart"
              element={<ProtectedRoute Component={Chart} />}
            />
            <Route
              path="/history"
              element={<ProtectedRoute Component={History} />}
            />

            <Route
              path="/itemsHistory"
              element={<ProtectedRoute Component={Fpa_FailedItems} />}
            />

            <Route
              path="/lineHistory"
              element={<ProtectedRoute Component={LineHistory} />}
            />

            <Route
              path="/delete"
              element={<ProtectedRoute Component={DeleteFloor} />}
            />
            <Route
              path="/assignopt"
              element={<ProtectedRoute Component={AssignOperator} />}
            />

            <Route path='/superadmin' Component={AdminLogin}/>
          </Routes>
        </UserProvider>
      </ErrorBoundary>
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </>
  );
}

export default withScreenSizeCheck(App);