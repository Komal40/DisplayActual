import logo from './logo.svg';
import './App.css'
import {BrowserRouter , Routes, Route} from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Login from './Components/Login/Login'
import Dashboard from './Components/Dashboard/Dashboard';


function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/app' element={<Dashboard/>}/>
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
