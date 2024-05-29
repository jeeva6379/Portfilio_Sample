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

// import App from './App.jsx'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="createnewuser" element={<CreateNewUser />} />
            <Route path="goal-sheet/:id" element={<GoalSheet />} />
            <Route path="manageusers" element={<ManageUser />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
