import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import axios from "axios";

//login component for user authentication
function Login() {

  //get the API_URL from environmental variables
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  //set state variables manage data and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});



  //function to handle change in email input field
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  //function to handle change in password input field
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

 
//funtcion to validate from email, password
  const validate = () => {
    const validationErrors = {};
    let isValid = true;

    //regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      validationErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      validationErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      validationErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      validationErrors.password =
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character";
      isValid = false;
    }

    //set validation errors
    setErrors(validationErrors);
    return isValid;
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    //validation the form before submission
    if (!validate()) {
      return;
    }

    try {
      //send login request to API
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });

      //if login successful, store the token local and navigate to dashboard
      if (response.status === 200) {
        alert(response.data.message);

        const token = response.data.token;
        localStorage.setItem("token", token);

        //crear form fields after login
        setEmail("");
        setPassword("");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ login: "Invalid email or password" });
    }
  };

  return (
    <div className="Page">
      <div className="main">
        <div className="signup">
          <div className="text-center">
            <h2>
              <strong>Goal System</strong>
            </h2>
          </div>
          <Form onSubmit={handleSubmit}>
            <div className="container mt-5">
              <div className="form-floating mb-4">
                <input
                  id="emailInput"
                  className={`form-control line-input ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  type="text"
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                />
                <label htmlFor="emailInput">Email address</label>
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className={`form-control line-input ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  id="passwordInput"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <label htmlFor="passwordInput">Password</label>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </div>

              {errors.login && (
                <div className="alert alert-danger" role="alert">
                  {errors.login}
                </div>
              )}

              <button className="home-btn mt-5" type="submit">
                Log-in
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
