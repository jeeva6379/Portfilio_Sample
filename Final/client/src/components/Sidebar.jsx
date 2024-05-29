import { useEffect, useState } from "react";

import axios from "axios";
import { FaRightFromBracket, FaBars } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import "./Sidebar.css";


const Sidebar = () => {
  
  //get the API_URL from environmental variables and navigation hook
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

    // state variables to userData, showMobileMenu, user
  const [userData, setUserData] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState('');

//function to fetch user data
  const getUserData = async () => {
    try {

      //send get request to fetch user data
      const response = await axios.get(`${API_URL}/api/user-info`);

      //set the user data in the state and local stroage
      const user = response.data.user;
      setUserData(user);
      localStorage.setItem("user_id", user._id);
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("user_role", user.role);
    } catch (error) {
      //redirect to home page if any errors occurs
      console.log(error);
      navigate("/");
    }
  };

  //fetch userdata the component 
  useEffect(() => {
    getUserData();
  }, []);

  //function to handle user logout
  const logout = () => {
    
    //clear local storage and navigate to login page
    localStorage.clear();
    navigate("/");
  };

  //function to toggle the mobile menu visibility
  const toggleMenu = () => {
    setShowMobileMenu(value => !value)
  }

  //get the users role from local storage
  const user_role =localStorage.getItem("user_role", user);


  return (
    <div className="sidebar">
      <h5 className="d-flex justify-content-between"><span>Goal App</span> <FaBars className="menu-toggle-btn" onClick={toggleMenu}/></h5>
        <div className={`${showMobileMenu && 'show'} menu`}>
          <Link className="link" to="/dashboard">
            Home
          </Link>
          {user_role === 'HR' && (
        <Link className="link" to="/createnewuser">
          Create User
        </Link>)}
          {user_role === 'HR' && (
        <Link className="link" to="/manageusers">
          Manage Users
        </Link>)}
        {user_role === 'Employee' && (
          <a className="link" href="/dashboard?q=create-goal-sheet">Create Goal Sheet</a>)}
          <a className="link" href="/dashboard">All Goal Sheets</a>
          <a className="link" href="/dashboard?q=submitted-goal-sheets">Submitted Goal Sheets</a>
        </div>

      <div className={`actions flex-1 text-center ${showMobileMenu && ' show' }`}>
        <div className="user-info mb-2">{userData.username ? userData.username : "User Name"}</div>
        <button className="logout-btn" onClick={logout}>
          Logout <FaRightFromBracket className="ml-2 ms-2" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
