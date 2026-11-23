import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { Check, X, Clock, HelpCircle, Save, CheckCircle } from 'lucide-react';
import Toast from '../common/Toast';

const AttendanceManager = ({ courses = [] }) => {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?._id || '');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Update selected course if courses prop loads later
  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0]._id);
    }
  }, [courses, selectedCourse]);

  // Load students enrolled in the selected course and their existing attendance for this date
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedCourse) return;
      setLoading(true);
      try {
        // Fetch all students
        const studentRes = await studentService.getAll({ limit: 100 });
        const allStudents = studentRes.students || [];

        // Filter students enrolled in this course or enrolled generally
        const enrolled = allStudents.filter(
          (s) =>
            s.coursesEnrolled?.some(
              (c) => (c._id || c) === selectedCourse
            ) || allStudents.length <= 10 // fallback if enrollment not strictly bound
        );

        setStudents(enrolled);

        // Fetch existing attendance records for this course & date
        const attRes = await attendanceService.getAttendance({
          courseId: selectedCourse,
          date: selectedDate,
          limit: 100,
        });

        const initialStatus = {};
        const initialRemarks = {};

        // Default all enrolled students to 'Present'
        enrolled.forEach((s) => {
          initialStatus[s._id] = 'Present';
          initialRemarks[s._id] = '';
        });

        // Overlay with recorded data if present
        if (attRes.attendance) {
          attRes.attendance.forEach((item) => {
            if (item.student?._id) {
              initialStatus[item.student._id] = item.status;
              initialRemarks[item.student._id] = item.remarks || '';
            }
          });
        }

        setAttendanceMap(initialStatus);
        setRemarksMap(initialRemarks);
      } catch (err) {
        console.error('Failed to load roster:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedCourse, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setRemarksMap((prev) => ({ ...prev, [studentId]: remark }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveBulk = async () => {
    if (!selectedCourse || students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: attendanceMap[s._id] || 'Present',
        remarks: remarksMap[s._id] || '',
      }));

      await attendanceService.recordBulk({
        courseId: selectedCourse,
        date: selectedDate,
        records,
      });

      setToast({
        type: 'success',
        message: `Attendance roster for ${selectedDate} saved successfully!`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save attendance roster.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAll('Present')}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('Absent')}
            className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            Mark All Absent
          </button>
          <button
            type="button"
            onClick={handleSaveBulk}
            disabled={saving || loading || students.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Roster...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Student Roster Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-7 h-7 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
          Loading student roster for this course...
        </div>
      ) : students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-center">Attendance Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const currentStatus = attendanceMap[student._id] || 'Present';
                return (
                  <tr key={student._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {student.department} (Sem {student.semester})
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {['Present', 'Late', 'Absent', 'Excused'].map((st) => {
                          const isSelected = currentStatus === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(student._id, st)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                isSelected
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Late'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : st === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={remarksMap[student._id] || ''}
                        onChange={(e) =>
                          handleRemarkChange(student._id, e.target.value)
                        }
                        className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400">
          No students found enrolled in this selected course.
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
