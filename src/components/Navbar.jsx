import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice'; // your actual path
import { Link } from 'react-router-dom';

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">Expense Tracker</div>

        <Link to="/">Dashboard</Link>

        {user ? (
          <>
            <span className="user-chip">{user.name || user.email}</span>
            <button className="btn" onClick={() => dispatch(logout())}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
