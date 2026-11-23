import React, { useState, useEffect } from 'react';
import { resultService } from '../../services/resultService';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { Plus, Edit2, Trash2, Award, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import ConfirmDialog from '../common/ConfirmDialog';

const ResultManager = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Filter state
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');

  // Form state
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    examType: 'Midterm',
    marksObtained: '',
    totalMarks: 100,
    semester: 1,
    academicYear: '2024-2025',
    remarks: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, stuData, crsData] = await Promise.all([
        resultService.getResults({
          courseId: selectedCourse !== 'All' ? selectedCourse : undefined,
          semester: selectedSemester !== 'All' ? selectedSemester : undefined,
          limit: 100,
        }),
        studentService.getAll({ limit: 100 }),
        courseService.getAll({ limit: 100 }),
      ]);

      setResults(resData.results || []);
      setStudents(stuData.students || []);
      setCourses(crsData.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourse, selectedSemester]);

  const handleOpenModal = (res = null) => {
    if (res) {
      setSelectedResult(res);
      setFormData({
        student: res.student?._id || '',
        course: res.course?._id || '',
        examType: res.examType || 'Midterm',
        marksObtained: res.marksObtained,
        totalMarks: res.totalMarks || 100,
        semester: res.semester || 1,
        academicYear: res.academicYear || '2024-2025',
        remarks: res.remarks || '',
      });
    } else {
      setSelectedResult(null);
      setFormData({
        student: students[0]?._id || '',
        course: courses[0]?._id || '',
        examType: 'Midterm',
        marksObtained: '',
        totalMarks: 100,
        semester: 1,
        academicYear: '2024-2025',
        remarks: '',
      });
    }
    setModalOpen(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!formData.student || !formData.course || formData.marksObtained === '') {
      setToast({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    try {
      if (selectedResult) {
        await resultService.update(selectedResult._id, formData);
        setToast({ type: 'success', message: 'Result updated successfully' });
      } else {
        await resultService.create(formData);
        setToast({ type: 'success', message: 'Examination marks published successfully' });
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save examination marks',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await resultService.delete(deleteId);
      setToast({ type: 'success', message: 'Result record removed successfully' });
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete result record' });
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Course Filter
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="All">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Publish Examination Result
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="px-5 py-3.5">Roll No</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Course Code & Name</th>
                <th className="px-5 py-3.5">Exam Type</th>
                <th className="px-5 py-3.5">Marks Obtained</th>
                <th className="px-5 py-3.5">Grade</th>
                <th className="px-5 py-3.5">Remarks</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Loading marks and grade sheets...
                  </td>
                </tr>
              ) : results.length > 0 ? (
                results.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">
                      {res.student?.rollNumber || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {res.student?.firstName} {res.student?.lastName}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {res.course?.courseCode} - {res.course?.courseName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {res.examType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {res.marksObtained} / {res.totalMarks}{' '}
                      <span className="text-[11px] font-normal text-slate-500">
                        ({res.percentage}%)
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded font-extrabold text-[11px] ${
                          res.grade === 'A+' || res.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : res.grade === 'B+' || res.grade === 'B'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : res.grade === 'F'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {res.grade}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 italic">
                      {res.remarks || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(res)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Marks"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(res._id);
                            setConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No results found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Result Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedResult ? 'Update Examination Marks' : 'Publish Student Marks'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student *
            </label>
            <select
              value={formData.student}
              onChange={(e) => setFormData({ ...formData, student: e.target.value })}
              required
              disabled={!!selectedResult}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.rollNumber} - {s.firstName} {s.lastName} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Course *
            </label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              required
              disabled={!!selectedResult}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exam Type
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="Midterm">Midterm Exam</option>
                <option value="Final">Final Examination</option>
                <option value="Quiz">Class Quiz / Test</option>
                <option value="Assignment">Course Assignment</option>
                <option value="Practical">Lab / Practical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                min="0"
                max={formData.totalMarks}
                step="0.5"
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Total Marks
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teacher Feedback / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Excellent analytical performance"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {selectedResult ? 'Update Score' : 'Publish Marks'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Examination Score"
        message="Are you sure you want to permanently delete this student's exam score?"
      />
    </div>
  );
};

export default ResultManager;
