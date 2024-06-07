import './App.css'
import {BrowserRouter , Routes, Route} from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Login from './Components/Login/Login'
import Dashboard from './Components/Dashboard/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import Register from './Components/Register/Register';
import Update from './Components/Update/Update';
import Parts from './Components/Parts/Parts';
import Process from './Components/Process/Process';
import Parameters from './Components/Parameters/Parameters';
import Task from './Components/Task/Task';
import TaskNew from './Components/TaskNew/TaskNew';
import Chart from './Components/Chart/Chart';
import withScreenSizeCheck from './WithScreenSizeCheck';
import DeleteFloor from './Components/DeleteFloor/DeleteFloor';
import AssignOperator from './Components/AssignOperator/AssignOperator';
import TaskPrac from './Components/TaskPrac/TaskPrac';
import StationList from './Components/TaskPrac/StationList';




function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path='/' element={<ProtectedRoute Component={Login}/>}/>
      <Route path='/register' element={<ProtectedRoute Component={Register}/>}/>
      <Route path='/app' element={<ProtectedRoute Component={Dashboard}/>}/>
      <Route path='/update' element={<ProtectedRoute Component={Update}/>}/>
      <Route path='/parts' element={<ProtectedRoute Component={Parts}/>}/>
      <Route path='/process' element={<ProtectedRoute Component={Process}/>}/>
      <Route path='/para' element={<ProtectedRoute Component={Parameters}/>}/>
      <Route path='/task' element={<ProtectedRoute Component={TaskPrac}/>}/>
      {/* <Route path='/task' element={<ProtectedRoute Component={StationList}/>}/> */}
      {/* <Route path='/task' element={<ProtectedRoute Component={TaskNew}/>}/> */}
      <Route path='/chart' element={<ProtectedRoute Component={Chart}/>}/>
      <Route path='/delete' element={<ProtectedRoute Component={DeleteFloor}/>}/>
      <Route path='/assignopt' element={<ProtectedRoute Component={AssignOperator}/>}/>
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default withScreenSizeCheck(App);