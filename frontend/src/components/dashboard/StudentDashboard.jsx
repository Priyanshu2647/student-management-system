import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  Award,
  GraduationCap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../common/StatCard';
import RecentNoticesWidget from './RecentNoticesWidget';

const StudentDashboard = ({ data }) => {
  const { student, stats, enrolledCourses, recentResults, recentNotices } = data;

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs mb-2">
              Roll No: {student?.rollNumber || 'STU'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.name}!
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Department of {student?.department} • Semester {student?.semester}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <span className="text-xs uppercase tracking-wider text-blue-100 font-medium">
              Cumulative GPA
            </span>
            <div className="text-3xl font-black text-white mt-0.5">
              {stats?.cgpa ? stats.cgpa.toFixed(2) : 'N/A'}
            </div>
            <span className="text-[11px] text-blue-200">Scale of 10.0</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Overall Attendance"
          value={`${stats?.attendancePercentage ?? 0}%`}
          icon={CalendarCheck}
          color={stats?.attendancePercentage >= 75 ? 'green' : 'rose'}
          subtitle={
            stats?.attendancePercentage >= 75
              ? 'Above required 75% threshold'
              : 'Attention: below 75% minimum requirement'
          }
        />
        <StatCard
          title="Enrolled Courses"
          value={stats?.enrolledCoursesCount ?? 0}
          icon={BookOpen}
          color="blue"
          subtitle="Subjects registered this term"
        />
        <StatCard
          title="Examinations Taken"
          value={stats?.totalExamsTaken ?? 0}
          icon={Award}
          color="purple"
          subtitle="Midterm, practical & final tests"
        />
      </div>

      {/* Two Column Layout: Courses & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Enrolled Courses & Recent Exam Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Courses list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Enrolled Courses</h3>
              <Link
                to="/courses"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                All Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enrolledCourses && enrolledCourses.length > 0 ? (
                enrolledCourses.map((c) => (
                  <div
                    key={c._id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {c.courseCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {c.credits} Credits
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                      {c.courseName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Semester {c.semester}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 col-span-2 text-center">
                  No courses enrolled currently.
                </p>
              )}
            </div>
          </div>

          {/* Recent Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Recent Examination Scores
              </h3>
              <Link
                to="/results"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Full Grade Card <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Course</th>
                    <th className="pb-3">Exam Type</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Grade</th>
                    <th className="pb-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentResults && recentResults.length > 0 ? (
                    recentResults.map((res) => (
                      <tr key={res._id} className="hover:bg-slate-50/60">
                        <td className="py-3 font-semibold text-slate-800">
                          {res.course?.courseCode} - {res.course?.courseName}
                        </td>
                        <td className="py-3 text-slate-600">{res.examType}</td>
                        <td className="py-3 font-semibold text-slate-900">
                          {res.marksObtained} / {res.totalMarks} ({res.percentage}%)
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
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
                        <td className="py-3 text-slate-500 italic">
                          {res.remarks || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400">
                        No examination results published yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Notice Board */}
        <div className="lg:col-span-1">
          <RecentNoticesWidget notices={recentNotices} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
