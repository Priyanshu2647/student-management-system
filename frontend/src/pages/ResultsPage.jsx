import React from 'react';
import { useAuth } from '../context/AuthContext';
import ResultManager from '../components/results/ResultManager';
import StudentResultView from '../components/results/StudentResultView';

const ResultsPage = () => {
  const { role } = useAuth();

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Examination & Results Center
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {role === 'student'
            ? 'Review certified examination grades, score breakdowns, and GPA transcripts'
            : 'Record student exam marks, calculate percentage grades, and manage scorecards'}
        </p>
      </div>

      {role === 'student' ? <StudentResultView /> : <ResultManager />}
    </div>
  );
};

export default ResultsPage;
