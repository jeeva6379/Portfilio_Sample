import { Outlet } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";

import "./Layout.css";

const Layout = () => {
    // interceptor to attach JWT token to outgoing requests if available.
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");//get token for local storage
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`; // attach token to request headers.
      }
      return config;
    },
    (error) => {
      Promise.reject(error);// reject the request error occurs.
    }
  );

  return (
        
    // main layout structure with sidebar and main area
    <div className="layout">
      <Sidebar />{/* render the Sidebar component. */}
      <div className="main-content">{/* main content area. */}
        <Outlet />{/* render current route within main content area */}
      </div>
    </div>
  );
};

export default Layout;
