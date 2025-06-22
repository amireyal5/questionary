// src/components/QuestionnaireForm.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { isValidIsraeliID } from '../utils/validation';
import useDebounce from '../hooks/useDebounce'; // <-- 1. ייבוא ה-Hook החדש
import GovernmentSeal from './GovernmentSeal';

function QuestionnaireForm() {
  const [intervieweeId, setIntervieweeId] = useState('');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  
  // States חדשים לניהול הבדיקה בזמן אמת
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idError, setIdError] = useState('');
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  // 2. שימוש ב-Debounce על הערך של תעודת הזהות
  const debouncedIntervieweeId = useDebounce(intervieweeId, 500); // השהייה של 500ms

  // 3. פונקציית בדיקה שתרוץ רק כשהערך ה-debounced משתנה
  const checkIdExists = useCallback(async (id) => {
    if (!isValidIsraeliID(id)) {
      if (id.length === 9) { // הצג שגיאה רק אם הוקלדו 9 ספרות והן לא תקינות
        setIdError('מספר תעודת הזהות אינו תקין.');
      } else {
        setIdError(''); // נקה שגיאה אם עוד לא הגיעו ל-9 ספרות
      }
      setIsCheckingId(false);
      return;
    }
    
    setIdError(''); // איפוס שגיאת תקינות אם הת.ז תקינה
    setIsCheckingId(true); // הצג חיווי טעינה
    
    const docRef = doc(db, 'questionnaires', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const submissionDate = existingData.submissionTimestamp.toDate();
      const errorMessage = `ת.ז. זו כבר קיימת במערכת. מולאה על ידי ${existingData.interviewerName} בתאריך ${submissionDate.toLocaleDateString('he-IL')}.`;
      setIdError(errorMessage);
    } else {
      setIdError(''); // נקה שגיאה אם הת.ז. פנויה
    }
    
    setIsCheckingId(false);
  }, []);

  // 4. useEffect שמאזין לשינויים בערך ה-debounced
  useEffect(() => {
    if (debouncedIntervieweeId && debouncedIntervieweeId.length >= 9) {
      checkIdExists(debouncedIntervieweeId);
    } else {
      setIdError(''); // נקה שגיאות אם השדה מתרוקן או קצר מדי
    }
  }, [debouncedIntervieweeId, checkIdExists]);


  const handleIdChange = (e) => {
    const newId = e.target.value.replace(/\D/g, ''); // אפשר רק ספרות
    if (newId.length <= 9) {
      setIntervieweeId(newId);
    }
  };

  const handleAnswerChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setIntervieweeId('');
    setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' });
    setIdError('');
    setFormMessage({ type: '', text: ''});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });

    // 5. בדיקה סופית לפני השליחה (למקרה שהמשתמש מיהר)
    if (idError) {
      setFormMessage({ type: 'error', text: 'לא ניתן לשלוח את הטופס. ישנה שגיאה בשדה תעודת הזהות.' });
      return;
    }
    if (!isValidIsraeliID(intervieweeId)) {
      setFormMessage({ type: 'error', text: 'תעודת הזהות אינה תקינה.' });
      return;
    }

    const interviewerDataString = localStorage.getItem('interviewerData');
    if (!interviewerDataString) {
      setFormMessage({ type: 'error', text: 'שגיאה: לא נמצאו פרטי מראיין. אנא התחבר שוב.' });
      return;
    }
    const interviewerData = JSON.parse(interviewerDataString);

    const questionnaireData = {
      intervieweeId,
      answers,
      interviewerName: `${interviewerData.firstName} ${interviewerData.lastName}`,
      interviewerId: interviewerData.interviewerId,
      interviewerUid: interviewerData.uid,
      submissionTimestamp: serverTimestamp(),
    };

    try {
      const docRef = doc(db, 'questionnaires', intervieweeId);
      await setDoc(docRef, questionnaireData);
      setFormMessage({ type: 'success', text: 'השאלון נשמר בהצלחה!' });
      resetForm();
      setTimeout(() => setFormMessage({ type: '', text: ''}), 5000); // נקה הודעה אחרי 5 שניות
    } catch (error) {
      setFormMessage({ type: 'error', text: 'אירעה שגיאה בשמירת השאלון.' });
      console.error("Error writing document: ", error);
    }
  };

  const questions = [
      { id: 'q1', label: 'שאלה 1: ספר/י על עצמך' },
      { id: 'q2', label: 'שאלה 2: מהן החוזקות שלך?' },
      { id: 'q3', label: 'שאלה 3: מהן החולשות שלך?' },
      { id: 'q4', label: 'שאלה 4: היכן את/ה רואה את עצמך בעוד 5 שנים?' },
      { id: 'q5', label: 'שאלה 5: מדוע את/ה רוצה לעבוד אצלנו?' },
  ];

  return (
    <div className="form-container">
      <GovernmentSeal />
      <h2>שאלון למרואיין</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="intervieweeId">ת.ז. מרואיין</label>
          <input
            type="text"
            id="intervieweeId"
            name="intervieweeId"
            placeholder="הזן 9 ספרות"
            value={intervieweeId}
            onChange={handleIdChange}
            required
            autoComplete="off"
          />
          {/* 6. הצגת חיווי טעינה והודעת שגיאה מתחת לשדה */}
          {isCheckingId && <div className="validation-message info">בודק נתונים...</div>}
          {idError && <small className="error-message-inline">{idError}</small>}
        </div>

        {questions.map(q => (
             <div key={q.id}>
                <label htmlFor={q.id}>{q.label}</label>
                <textarea
                    id={q.id}
                    name={q.id}
                    value={answers[q.id]}
                    onChange={handleAnswerChange}
                    rows="4"
                    required
                />
            </div>
        ))}
        {/* 7. נעילת כפתור השליחה אם יש שגיאה או בדיקה בתהליך */}
        <button type="submit" disabled={isCheckingId || !!idError}>
          {isCheckingId ? 'ממתין לבדיקת ת.ז...' : 'שמור שאלון'}
        </button>
      </form>
      {formMessage.text && (
        <p className={`message ${formMessage.type}-message`}>{formMessage.text}</p>
      )}
    </div>
  );
}

export default QuestionnaireForm;