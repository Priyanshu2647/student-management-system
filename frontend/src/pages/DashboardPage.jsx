import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import Loader from '../components/common/Loader';

const DashboardPage = () => {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || 'Failed to load dashboard metrics');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to connect to dashboard API');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <Loader fullScreen message="Loading dashboard intelligence..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700 text-sm">
        <h3 className="font-bold">Error loading dashboard</h3>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {role === 'admin' && data && <AdminDashboard data={data} />}
      {role === 'teacher' && data && <TeacherDashboard data={data} />}
      {role === 'student' && data && <StudentDashboard data={data} />}
    </div>
  );
};

export default DashboardPage;
