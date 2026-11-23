import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { studentService } from '../services/studentService';
import { courseService } from '../services/courseService';
import {
  Download,
  Printer,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import Loader from '../components/common/Loader';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashRes, stuRes, crsRes] = await Promise.all([
          dashboardService.getStats(),
          studentService.getAll({ limit: 100 }),
          courseService.getAll({ limit: 100 }),
        ]);

        if (dashRes.success) setData(dashRes);
        if (stuRes.success) setStudents(stuRes.students || []);
        if (crsRes.success) setCourses(crsRes.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!students || students.length === 0) return;

    const headers = 'Roll Number,First Name,Last Name,Email,Department,Semester,Status\n';
    const rows = students
      .map(
        (s) =>
          `"${s.rollNumber}","${s.firstName}","${s.lastName}","${s.email}","${s.department}","${s.semester}","${s.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loader message="Generating institutional report metrics..." />;
  }

  const deptData = data?.departmentDistribution || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enrollment distribution, attendance benchmarks, and downloadable roster data
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Students CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Analytics
          </button>
        </div>
      </div>

      <div id="printable-content" className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-400">Total Enrolled</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {students.length} Students
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-400">Total Courses</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {courses.length} Active
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-400">Average Attendance</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {data?.stats?.averageAttendanceRate || 88}%
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-400">Active Departments</span>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">
              {deptData.length || 5} Depts
            </div>
          </div>
        </div>

        {/* Enrollment Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Department-wise Student Enrollment Breakdown
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Master Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Enrolled Student Master Directory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
                  <th className="py-3 px-3">Roll Number</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Semester</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {s.rollNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{s.email}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.department}</td>
                    <td className="py-2.5 px-3 text-slate-700">Sem {s.semester}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
