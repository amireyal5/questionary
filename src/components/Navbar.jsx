// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };
    
    // הצגת שם המראיין מ-localStorage
    const interviewerDataString = localStorage.getItem('interviewerData');
    const interviewerName = interviewerDataString ? JSON.parse(interviewerDataString).firstName : '';


    return (
        <nav className="navbar">
            <h1>מערכת שאלונים</h1>
            <ul>
                {currentUser && (
                    <>
                        <li><Link to="/">מילוי שאלון</Link></li>
                        <li><Link to="/dashboard">צפייה בשאלונים</Link></li>
                        <li>
                           <span>שלום, {interviewerName}</span>
                           <button onClick={handleLogout} className="logout-btn">התנתק</button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    )
}

export default Navbar;