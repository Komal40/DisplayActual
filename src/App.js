import logo from './logo.svg';
import './App.css'
import {BrowserRouter , Routes, Route} from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Login from './Components/Login/Login'
import Dashboard from './Components/Dashboard/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import Register from './Components/Register/Register';


function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path='/' element={<ProtectedRoute Component={Login}/>}/>
      <Route path='/register' element={<ProtectedRoute Component={Register}/>}/>
      <Route path='/app' element={<ProtectedRoute Component={Dashboard}/>}/>
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
