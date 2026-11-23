import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  CalendarCheck,
  Award,
  Bell,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import StatCard from '../common/StatCard';
import RecentNoticesWidget from './RecentNoticesWidget';

const TeacherDashboard = ({ data }) => {
  const { stats, assignedCourses, recentNotices } = data;

  return (
    <div className="space-y-8">
      {/* Teacher Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs mb-3">
            Faculty Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Faculty Teaching Workspace
          </h2>
          <p className="mt-2 text-sm text-purple-100 leading-relaxed">
            Record class attendance, evaluate examination submissions, monitor assigned student progress, and publish academic announcements.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Assigned Courses"
          value={stats?.myCoursesCount ?? 0}
          icon={BookOpen}
          color="purple"
          subtitle="Active subjects this term"
        />
        <StatCard
          title="Total Students"
          value={stats?.myStudentsCount ?? 0}
          icon={Users}
          color="blue"
          subtitle="Enrolled across my courses"
        />
        <StatCard
          title="Today's Attendance Logs"
          value={stats?.todayAttendanceCount ?? 0}
          icon={CalendarCheck}
          color="green"
          subtitle="Records submitted today"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/attendance"
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Mark Attendance</h4>
            <p className="text-xs text-slate-500">Record today's lecture roster</p>
          </div>
        </Link>

        <Link
          to="/results"
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Enter Exam Marks</h4>
            <p className="text-xs text-slate-500">Add or edit exam scores</p>
          </div>
        </Link>

        <Link
          to="/notices"
          className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Post Announcement</h4>
            <p className="text-xs text-slate-500">Broadcast class notices</p>
          </div>
        </Link>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Courses List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Assigned Courses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Current semester syllabus & teaching units</p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {assignedCourses && assignedCourses.length > 0 ? (
              assignedCourses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {course.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{course.courseName}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Department: {course.department} • Semester {course.semester} • {course.credits} Credits
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/attendance?course=${course._id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Attendance
                    </Link>
                    <Link
                      to={`/results?course=${course._id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Marks
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                No courses currently assigned. Please contact the administrator.
              </p>
            )}
          </div>
        </div>

        {/* Notices (1 col) */}
        <div className="lg:col-span-1">
          <RecentNoticesWidget notices={recentNotices} />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
