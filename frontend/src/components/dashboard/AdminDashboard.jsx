import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  Bell,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../common/StatCard';
import RecentNoticesWidget from './RecentNoticesWidget';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const STATUS_COLORS = {
  Present: '#10b981',
  Late: '#f59e0b',
  Absent: '#ef4444',
  Excused: '#6366f1',
};

const AdminDashboard = ({ data }) => {
  const { stats, recentStudents, recentNotices, departmentDistribution, attendanceDistribution } = data;

  const attendanceChartData = (attendanceDistribution || []).map((item) => ({
    name: item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#94a3b8',
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs mb-3">
            Academic Year 2025–2026
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Command Center
          </h2>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Monitor real-time institutional metrics, student admissions, faculty workloads, attendance, and exam results.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          color="blue"
          subtitle="Enrolled & active learners"
        />
        <StatCard
          title="Faculty Members"
          value={stats?.totalTeachers ?? 0}
          icon={GraduationCap}
          color="purple"
          subtitle="Teaching staff & professors"
        />
        <StatCard
          title="Offered Courses"
          value={stats?.totalCourses ?? 0}
          icon={BookOpen}
          color="green"
          subtitle="Across all departments"
        />
        <StatCard
          title="Avg. Attendance Rate"
          value={`${stats?.averageAttendanceRate ?? 0}%`}
          icon={CalendarCheck}
          color="amber"
          subtitle="Institutional attendance benchmark"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Students by Department
            </h3>
            <span className="text-xs font-medium text-slate-500">Active enrollments</span>
          </div>
          <div className="h-64">
            {departmentDistribution && departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                    {departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department data available
              </div>
            )}
          </div>
        </div>

        {/* Attendance Distribution Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Overall Attendance Ratio
            </h3>
            <span className="text-xs font-medium text-slate-500">Cumulative status</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {attendanceChartData && attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {attendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No attendance records yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Registrations & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Student Registrations
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest students admitted to programs
              </p>
            </div>
            <Link
              to="/students"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Roll No.</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Semester</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents && recentStudents.length > 0 ? (
                  recentStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-medium text-slate-900">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-3 font-mono text-slate-600">{s.rollNumber}</td>
                      <td className="py-3 text-slate-600">{s.department}</td>
                      <td className="py-3 text-slate-600">Sem {s.semester}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No recent student registrations
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notices Widget (1 col) */}
        <div className="lg:col-span-1">
          <RecentNoticesWidget notices={recentNotices} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
