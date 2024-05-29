import { useEffect, useState } from "react";

import axios from "axios";

import './ManageUser.css'

//ManageUser componet for handling user details access and manage
const ManageUser = () => {

//get the API_URL from environmental variables
const API_URL = import.meta.env.VITE_API_URL;

  // state variables to manage users, loading , error, and editing user
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);

  //fetch users component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {

        //get the token from local storage
        const token = localStorage.getItem("token");

        //get request to fetch users
        const response = await axios.get(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        //set the users state with fetch data
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Error fetching users");
      } finally {
        //set loading is false after the request is completed 
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  //handle delete user by its id
  const handleDelete = async (userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      //make delete request to delete the user 
      await axios.delete(`${API_URL}/api/delete-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //update the users state to remove the deleted user
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Error deleting user");
    }
  };

  // handle editing a user by setting the editUser state
  const handleEdit = (user) => {
    setEditUser(user);
  };

    //handle update user by its id
  const handleUpdate = async (userId, updatedUser) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      // put request to update the user
      const response = await axios.put(`${API_URL}/api/update-user/${userId}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     //update the users state with updated user data
      setUsers(users.map((user) => (user._id === userId ? response.data : user)));
      
      //clear the edituser state after updating
      setEditUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error updating user");
    }
  };

  //define the possible roles for users
  const roles = ["HR", "Reporting Manager", "Employee"];

  //show loading indicator for data being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  //show if any error occured
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4">User List</h2>
      {editUser && (
        <div className="edit-form mt-4 mb-5">
          <hr/>
          <h3>Edit User</h3>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate(editUser._id, {
                username: e.target.username.value,
                email: e.target.email.value,
                role: e.target.role.value,
              });
            }}
          >
            <label className="me-3">
              Username:
              <input type="text" name="username"  defaultValue={editUser.username} />
            </label>
            <label className="me-3">
              Email:
              <input type="email" name="email"  defaultValue={editUser.email} />
            </label>
            <label className="me-3">
              Role:
              <select name="role"  defaultValue={editUser.role}>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <button className="button edit" type="submit">Update</button>
            <button className="button delete" type="button" onClick={() => setEditUser(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
      <div className="table-container">
  <div className="table-scroll">
    <table className="normal-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(users) &&
          users.map((user) => (
            <tr key={user._id}>
              <td data-label="Username">{user.username}</td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Role">{user.role}</td>
              <td data-label="Actions">
                <button className="button edit" onClick={() => handleEdit(user)}>Edit</button>
                <button className="button delete" onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>


     
    </div>
  );
};

export default ManageUser;
