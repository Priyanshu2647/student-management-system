import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

const CourseFormModal = ({
  isOpen,
  onClose,
  onSave,
  course = null,
  teachers = [],
  isLoading = false,
}) => {
  const isEdit = !!course;

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: 'Computer Science',
    semester: 1,
    credits: 3,
    description: '',
    teacher: '',
    maxCapacity: 60,
    status: 'Active',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        courseCode: course.courseCode || '',
        courseName: course.courseName || '',
        department: course.department || 'Computer Science',
        semester: course.semester || 1,
        credits: course.credits || 3,
        description: course.description || '',
        teacher: course.teacher?._id || course.teacher || '',
        maxCapacity: course.maxCapacity || 60,
        status: course.status || 'Active',
      });
    } else {
      setFormData({
        courseCode: '',
        courseName: '',
        department: 'Computer Science',
        semester: 1,
        credits: 3,
        description: '',
        teacher: '',
        maxCapacity: 60,
        status: 'Active',
      });
    }
    setError('');
  }, [course, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.courseCode || !formData.courseName || !formData.department) {
      setError('Course code, Course name and Department are required.');
      return;
    }

    onSave({
      courseCode: formData.courseCode,
      courseName: formData.courseName,
      department: formData.department,
      semester: Number(formData.semester),
      credits: Number(formData.credits),
      description: formData.description,
      teacher: formData.teacher || null,
      maxCapacity: Number(formData.maxCapacity),
      status: formData.status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Course Syllabus' : 'Add New Academic Course'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Code *
            </label>
            <input
              type="text"
              name="courseCode"
              placeholder="e.g. CS101"
              value={formData.courseCode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Title / Name *
            </label>
            <input
              type="text"
              name="courseName"
              placeholder="e.g. Data Structures & Algorithms"
              value={formData.courseName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Semester
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
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
              Credits (1 - 6)
            </label>
            <input
              type="number"
              name="credits"
              min="1"
              max="6"
              value={formData.credits}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Instructor / Teacher
            </label>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">-- No Teacher Assigned --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName} ({t.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Course Description / Syllabus Outline
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Key concepts, prerequisites, and learning objectives..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-blue-500/20"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CourseFormModal;
