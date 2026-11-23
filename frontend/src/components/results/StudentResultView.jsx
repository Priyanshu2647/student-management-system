import React, { useState, useEffect } from 'react';
import { resultService } from '../../services/resultService';
import { Award, Printer, Download, BookOpen } from 'lucide-react';
import Loader from '../common/Loader';

const StudentResultView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await resultService.getMyResults();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching student results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loader message="Compiling your academic grade transcript..." />;
  }

  const student = data?.student;
  const summary = data?.summary || { totalCredits: 0, cgpa: 0, overallPercentage: 0 };
  const results = data?.results || [];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Official Grade Sheet</h3>
          <p className="text-xs text-slate-500">
            Certified academic transcript and semester performance records
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Print Official Transcript
        </button>
      </div>

      {/* Printable Transcript Document Container */}
      <div
        id="printable-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6"
      >
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              EDUTRACK INSTITUTE OF TECHNOLOGY
            </h2>
            <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mt-0.5">
              Office of the Controller of Examinations
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Date of Issue: {new Date().toLocaleDateString()}</div>
            <div className="font-mono font-bold text-slate-900">Status: Verified Official</div>
          </div>
        </div>

        {/* Student Metadata Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Candidate Name</span>
            <span className="font-bold text-slate-900">{student?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Roll Number</span>
            <span className="font-mono font-bold text-blue-700">{student?.rollNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-bold text-slate-900">{student?.department}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Current Semester</span>
            <span className="font-bold text-slate-900">Semester {student?.semester}</span>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-bold">
                <th className="py-3 px-3">Course Code</th>
                <th className="py-3 px-3">Subject / Course Title</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-3 text-center">Exam Type</th>
                <th className="py-3 px-3 text-center">Marks Obtained</th>
                <th className="py-3 px-3 text-center">Max Marks</th>
                <th className="py-3 px-3 text-center">Letter Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length > 0 ? (
                results.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/40">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {r.course?.courseCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {r.course?.courseName}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-600">
                      {r.course?.credits || 3}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">
                      {r.examType}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {r.marksObtained}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {r.totalMarks}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-blue-50 text-blue-800 border border-blue-200">
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No examination records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* GPA Summary Footer */}
        <div className="border-t-2 border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-slate-500">
            <div>Grading Standard: 10-point scale (A+ = 10, A = 9, B+ = 8, B = 7, C = 6, D = 5, F = 0)</div>
            <div>Total Completed Credits: <span className="font-bold text-slate-800">{summary.totalCredits}</span></div>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Overall Percentage
              </span>
              <span className="text-xl font-bold text-slate-900">
                {summary.overallPercentage}%
              </span>
            </div>

            <div className="border-l pl-6 border-slate-200 text-right">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Cumulative GPA
              </span>
              <span className="text-3xl font-black text-blue-700">
                {summary.cgpa ? summary.cgpa.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResultView;
