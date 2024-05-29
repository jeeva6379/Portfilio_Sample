import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import GoalSheet from "./GoalSheet.jsx";
import Dashboard from "./Dashboard.jsx";
import CreateNewUser from "./CreateNewUser.jsx";
import Layout from "./Layout.jsx";

import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import ManageUser from "./components/ManageUser.jsx";


export default function App() {
  return (
    <>
          {/* BrowserRouter application to enable routing */}

      <BrowserRouter>
        <Routes>

          {/* Route for the root path */}
          <Route index element={<Login />} />
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />{/* route for the Dashboard component */}
            <Route path="createnewuser" element={<CreateNewUser />} />{/* route for the CreateNewUser component */}
            <Route path="goal-sheet/:id" element={<GoalSheet />} />{/* route for the GoalSheet component */}
            <Route path="manageusers" element={<ManageUser />} />{/* route for the ManageUser component */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

// rendering the root component using ReactDOM.createRoot() method
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
