import React from "react";
import {  Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import Navbar from "./components/Navbar";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashBoard from "./pages/Dashbord";
import HouseDetail from "./pages/HouseDetails";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";


function App() {

  return (
  <>
  <Navbar/>

    <Routes >
      <Route path="/" element={<HomePage />}/>
      <Route path="/listings" element={<Listings />}/>
      <Route path="/listings/:id" element={<HouseDetail />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/signup" element={<Signup />}/>
      <Route path="/profile" element={<Profile />}/>
      {/* Protected Route */}
      <Route 
        path="/dashboard" 
        element={
          
            <DashBoard />
        }
        />
    </Routes>
 

  </>
  );
}

export default App;