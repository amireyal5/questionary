// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'questionnaires'), orderBy('submissionTimestamp', 'desc'));
    
    // onSnapshot מאזין לשינויים בזמן אמת
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestionnaires(data);
      setLoading(false);
    });

    // ניקוי המאזין כשהרכיב יורד מהעץ
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>טוען נתונים...</p>;
  }

  return (
    <div className="dashboard-container">
      <h2>כל השאלונים</h2>
      {questionnaires.length === 0 ? (
        <p>עדיין לא מולאו שאלונים.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ת.ז. מרואיין</th>
              <th>שם המראיין</th>
              <th>תאריך מילוי</th>
              <th>שעת מילוי</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.map(q => (
              <tr key={q.id}>
                <td>{q.intervieweeId}</td>
                <td>{q.interviewerName}</td>
                <td>{q.submissionTimestamp?.toDate().toLocaleDateString('he-IL')}</td>
                <td>{q.submissionTimestamp?.toDate().toLocaleTimeString('he-IL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;