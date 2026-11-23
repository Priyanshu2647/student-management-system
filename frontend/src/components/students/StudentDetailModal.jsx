import React from 'react';
import Modal from '../common/Modal';
import { Mail, Phone, MapPin, ShieldAlert, BookOpen, Calendar } from 'lucide-react';

const StudentDetailModal = ({ isOpen, onClose, student }) => {
  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Detailed Profile"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
            {student.firstName?.charAt(0)}
            {student.lastName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-xs font-mono font-semibold text-blue-700">
              Roll No: {student.rollNumber} • Admission: {student.admissionNumber || 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.department} • Semester {student.semester} ({student.academicYear || '2024-2028'})
            </p>
          </div>
        </div>

        {/* Contact & Personal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">
              Contact Information
            </h4>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{student.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {student.address?.city
                  ? `${student.address.street}, ${student.address.city}, ${student.address.state} ${student.address.zipCode}`
                  : 'No address on file'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">
              Emergency & Guardian
            </h4>
            <div className="text-slate-700">
              <span className="font-semibold text-slate-900">
                {student.guardian?.name || 'Guardian not listed'}
              </span>{' '}
              {student.guardian?.relationship && (
                <span className="text-slate-500">({student.guardian.relationship})</span>
              )}
            </div>
            <div className="text-slate-600">
              Phone: {student.guardian?.phone || 'N/A'}
            </div>
            <div className="text-slate-600">
              Email: {student.guardian?.email || 'N/A'}
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Enrolled Academic Courses
          </h4>
          <div className="space-y-2">
            {student.coursesEnrolled && student.coursesEnrolled.length > 0 ? (
              student.coursesEnrolled.map((course) => (
                <div
                  key={course._id || course}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white text-xs"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-bold font-mono text-slate-800">
                      {course.courseCode || 'CRS'}
                    </span>
                    <span className="text-slate-700">{course.courseName || 'Course'}</span>
                  </div>
                  {course.credits && (
                    <span className="font-medium text-slate-500">{course.credits} Credits</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                No courses currently registered for this student.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailModal;
