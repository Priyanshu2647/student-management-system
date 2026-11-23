import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import AttendanceManager from '../components/attendance/AttendanceManager';
import StudentAttendanceView from '../components/attendance/StudentAttendanceView';
import Loader from '../components/common/Loader';

const AttendancePage = () => {
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(role !== 'student');

  useEffect(() => {
    if (role === 'student') return;

    const fetchCourses = async () => {
      try {
        let res;
        if (role === 'teacher') {
          res = await courseService.getTeacherAssigned();
        } else {
          res = await courseService.getAll({ limit: 100 });
        }
        if (res.success) {
          setCourses(res.courses || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [role]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Attendance Management System
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {role === 'student'
            ? 'Monitor your daily lecture attendance and subject-wise completion percentage'
            : 'Track class rosters, record daily attendance, and monitor attendance metrics'}
        </p>
      </div>

      {role === 'student' ? (
        <StudentAttendanceView />
      ) : loading ? (
        <Loader message="Loading assigned courses..." />
      ) : (
        <AttendanceManager courses={courses} />
      )}
    </div>
  );
};

export default AttendancePage;
