// src/components/Login.jsx
import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [interviewerId, setInterviewerId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !interviewerId) {
      setError('נא למלא את כל השדות');
      return;
    }

    try {
      setError('');
      const userCredential = await signInAnonymously(auth);
      const interviewerData = {
        uid: userCredential.user.uid,
        firstName,
        lastName,
        interviewerId,
      };
      // שמירת פרטי המראיין באחסון המקומי של הדפדפן
      localStorage.setItem('interviewerData', JSON.stringify(interviewerData));
      navigate('/'); // ניתוב לדף הראשי לאחר התחברות
    } catch (err) {
      setError('ההתחברות נכשלה. נסה שוב.');
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2>הזדהות מראיין</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="שם פרטי"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="שם משפחה"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="מספר תעודת זהות"
          value={interviewerId}
          onChange={(e) => setInterviewerId(e.target.value)}
          required
        />
        <button type="submit">התחבר</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;