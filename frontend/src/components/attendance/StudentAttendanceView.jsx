import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import Loader from '../common/Loader';

const StudentAttendanceView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await attendanceService.getMyAttendance();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching student attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return <Loader message="Fetching your attendance records..." />;
  }

  const summary = data?.summary || {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    overallPercentage: 0,
  };

  const courseBreakdown = data?.courseBreakdown || [];
  const recentRecords = data?.recentRecords || [];

  return (
    <div className="space-y-6">
      {/* Attendance Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Attendance Performance
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Academic Presence Tracker
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Minimum 75% required attendance to appear in semester examinations.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-xs text-slate-400 font-medium">Classes Attended</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {summary.presentDays} <span className="text-sm font-normal text-slate-400">/ {summary.totalDays}</span>
            </div>
          </div>

          <div className="text-center border-l pl-6 border-slate-200">
            <span className="text-xs text-slate-400 font-medium">Overall Rate</span>
            <div
              className={`text-3xl font-black mt-0.5 ${
                summary.overallPercentage >= 75
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {summary.overallPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Course Breakdown Cards */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Subject-wise Attendance Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseBreakdown.length > 0 ? (
            courseBreakdown.map((item) => (
              <div
                key={item.courseCode}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {item.courseCode}
                  </span>
                  <span
                    className={`text-sm font-extrabold ${
                      item.percentage >= 75
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>

                <h5 className="text-sm font-bold text-slate-800 line-clamp-1">
                  {item.courseName}
                </h5>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Attended: {item.present}</span>
                  <span>Total Lectures: {item.total}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 col-span-3 py-6 text-center">
              No lecture attendance logged yet.
            </p>
          )}
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Detailed Lecture Log
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="pb-3">Date</th>
                <th className="pb-3">Course</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.length > 0 ? (
                recentRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-medium text-slate-700">
                      {new Date(r.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {r.course?.courseCode} - {r.course?.courseName}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 italic">
                      {r.remarks || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400">
                    No past records recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceView;
