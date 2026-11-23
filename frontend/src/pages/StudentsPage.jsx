import React, { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import StudentFormModal from '../components/students/StudentFormModal';
import StudentDetailModal from '../components/students/StudentDetailModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Plus, Eye, Edit2, Trash2, Filter } from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

const StudentsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');
  const [status, setStatus] = useState('All');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        page: currentPage,
        limit: 10,
        search,
        department,
        semester,
        status,
      });

      if (res.success) {
        setStudents(res.students || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to fetch student directory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, department, semester, status]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSaveStudent = async (data) => {
    setActionLoading(true);
    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent._id, data);
        setToast({ type: 'success', message: 'Student profile updated successfully' });
      } else {
        await studentService.create(data);
        setToast({ type: 'success', message: 'New student enrolled successfully' });
      }
      setFormOpen(false);
      fetchStudents();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Error saving student record',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await studentService.delete(deleteId);
      setToast({ type: 'success', message: 'Student and account deleted successfully' });
      setConfirmOpen(false);
      fetchStudents();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete student record' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {row.firstName?.charAt(0)}
            {row.lastName?.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-[11px] text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Roll Number',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          {row.rollNumber}
        </span>
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
      header: 'Status',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedStudent(row);
              setDetailOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setSelectedStudent(row);
                  setFormOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit Student"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setDeleteId(row._id);
                  setConfirmOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Student"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Management Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of enrolled undergraduate and postgraduate students
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedStudent(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Enroll New Student
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
        data={students}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, roll number or email..."
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

      {/* Student Add/Edit Modal */}
      <StudentFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveStudent}
        student={selectedStudent}
        isLoading={actionLoading}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        student={selectedStudent}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Record"
        message="Are you sure you want to delete this student and their login credentials? All associated attendance and result logs will also be impacted."
        isLoading={actionLoading}
      />
    </div>
  );
};

export default StudentsPage;
