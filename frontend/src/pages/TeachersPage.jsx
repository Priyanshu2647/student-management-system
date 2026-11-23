import React, { useState, useEffect } from 'react';
import { teacherService } from '../services/teacherService';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import TeacherFormModal from '../components/teachers/TeacherFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Plus, Edit2, Trash2, Mail, Phone, BookOpen } from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

const TeachersPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await teacherService.getAll({
        page: currentPage,
        limit: 10,
        search,
        department,
      });

      if (res.success) {
        setTeachers(res.teachers || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to fetch faculty list' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, department]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTeachers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSaveTeacher = async (data) => {
    setActionLoading(true);
    try {
      if (selectedTeacher) {
        await teacherService.update(selectedTeacher._id, data);
        setToast({ type: 'success', message: 'Faculty profile updated successfully' });
      } else {
        await teacherService.create(data);
        setToast({ type: 'success', message: 'New teacher profile created successfully' });
      }
      setFormOpen(false);
      fetchTeachers();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Error saving faculty member',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await teacherService.delete(deleteId);
      setToast({ type: 'success', message: 'Faculty profile and account deleted' });
      setConfirmOpen(false);
      fetchTeachers();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete teacher record' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Faculty Member',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
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
      header: 'Teacher ID',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
          {row.teacherId}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Designation',
      accessor: 'designation',
    },
    {
      header: 'Assigned Courses',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>{row.assignedCourses?.length || 0} Courses</span>
        </div>
      ),
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
      render: (row) =>
        isAdmin ? (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                setSelectedTeacher(row);
                setFormOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit Faculty"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setDeleteId(row._id);
                setConfirmOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Faculty"
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
            Faculty & Teaching Staff
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Academic professors, department heads, and course lecturers
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedTeacher(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Faculty Member
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
        data={teachers}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search faculty by name, ID or email..."
        isLoading={loading}
        filters={
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
        }
      />

      {/* Teacher Form Modal */}
      <TeacherFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveTeacher}
        teacher={selectedTeacher}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteTeacher}
        title="Delete Faculty Member"
        message="Are you sure you want to remove this faculty record and user login? Assigned courses will need to be reassigned."
        isLoading={actionLoading}
      />
    </div>
  );
};

export default TeachersPage;
