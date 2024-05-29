import { useState } from "react";

import { FaEyeSlash, FaEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./CreateNewUser.css";

//component for create new user
const CreateNewUser = () => {

  //get the API_URL from environmental variables
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  //state variable for use data and error messages
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  //function of toogglepassword visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  //function to validation inputs of name, email, password, role
  const validateForm = () => {
    let isValid = true;

    
    if (!name) {
      errors.name = "Name is required";
      isValid = false;
    }
    
    //regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
      isValid = false;
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      errors.password =
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character";
      isValid = false;
    }

    if (!role) {
      errors.role = "Role is required";
      isValid = false;
    }
    //return validation results
    return errors, isValid;
  };

  //function to handle form submission 
  const handleSubmit = async (e) => {
    e.preventDefault();

    //validate form set errors ir any
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    //prapare form data submission 
    const formData = {
      username: name,
      email: email,
      password: password,
      role: role,
    };

    try {

      //send form data to API
      const response = await axios.post(
        `${API_URL}/api/create-newuser`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      //clear form data after success
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setErrors({});
      setMessage(`Success: ${response.data.message}`);

      //navigate to success after success full creation 
      navigate("/dashboard");

    } catch (error) {
      //if any error message request fails
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="create-new-user-container">
      <h4 className="text-center">Create New User</h4>
      <hr />
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <div className="password-input d-flex">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.password && (
            <p className="error-message">{errors.password}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="HR">HR</option>
            <option value="Reporting Manager">Reporting Manager</option>
            <option value="Employee">Employee</option>
          </select>
          {errors.role && <p className="error-message">{errors.role}</p>}
        </div>
        <button type="submit" className="submit-button">
          Create User
        </button>
      </form>
      {message && <p className="submit-message">{message}</p>}
    </div>
  );
};

export default CreateNewUser;
