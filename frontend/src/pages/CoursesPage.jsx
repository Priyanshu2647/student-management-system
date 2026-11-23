import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import { teacherService } from '../services/teacherService';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import CourseFormModal from '../components/courses/CourseFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Plus, Edit2, Trash2, BookOpen, GraduationCap } from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

const CoursesPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.getAll({
        page: currentPage,
        limit: 10,
        search,
        department,
        semester,
      });

      if (res.success) {
        setCourses(res.courses || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to fetch course offerings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll({ limit: 100 });
      if (res.success) {
        setTeachers(res.teachers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, department, semester]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCourses();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSaveCourse = async (data) => {
    setActionLoading(true);
    try {
      if (selectedCourse) {
        await courseService.update(selectedCourse._id, data);
        setToast({ type: 'success', message: 'Course curriculum updated successfully' });
      } else {
        await courseService.create(data);
        setToast({ type: 'success', message: 'New academic course published' });
      }
      setFormOpen(false);
      fetchCourses();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Error saving course',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await courseService.delete(deleteId);
      setToast({ type: 'success', message: 'Course syllabus removed' });
      setConfirmOpen(false);
      fetchCourses();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete course' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Course Code & Name',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              {row.courseCode}
            </span>
            <span className="font-bold text-slate-900">{row.courseName}</span>
          </div>
          {row.description && (
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Semester',
      render: (row) => `Sem ${row.semester}`,
    },
    {
      header: 'Credits',
      render: (row) => `${row.credits} Credits`,
    },
    {
      header: 'Assigned Instructor',
      render: (row) =>
        row.teacher ? (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              {row.teacher.firstName} {row.teacher.lastName}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) =>
        isAdmin ? (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                setSelectedCourse(row);
                setFormOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit Course"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setDeleteId(row._id);
                setConfirmOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Course Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive curriculum offerings, credit structures and instructors
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedCourse(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        )}
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      <DataTable
        columns={columns}
        data={courses}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search courses by code or title..."
        isLoading={loading}
        filters={
          <>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </>
        }
      />

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveCourse}
        course={selectedCourse}
        teachers={teachers}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteCourse}
        title="Delete Course Syllabus"
        message="Are you sure you want to delete this course? Students enrolled in it will have it unlinked."
        isLoading={actionLoading}
      />
    </div>
  );
};

export default CoursesPage;
