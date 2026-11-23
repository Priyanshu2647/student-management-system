import React, { useState, useEffect } from 'react';
import { noticeService } from '../services/noticeService';
import { useAuth } from '../context/AuthContext';
import NoticeFormModal from '../components/notices/NoticeFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import {
  Bell,
  Pin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  User,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Academic', 'Examination', 'Event', 'Holiday', 'Urgent'];

const NoticesPage = () => {
  const { role, user } = useAuth();
  const canPublish = role === 'admin' || role === 'teacher';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await noticeService.getNotices({
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        limit: 50,
      });

      if (res.success) {
        setNotices(res.notices || []);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load announcements' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSaveNotice = async (data) => {
    setActionLoading(true);
    try {
      if (selectedNotice) {
        await noticeService.update(selectedNotice._id, data);
        setToast({ type: 'success', message: 'Notice updated successfully' });
      } else {
        await noticeService.create(data);
        setToast({ type: 'success', message: 'Notice broadcasted successfully' });
      }
      setFormOpen(false);
      fetchNotices();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save notice',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await noticeService.delete(deleteId);
      setToast({ type: 'success', message: 'Notice deleted successfully' });
      setConfirmOpen(false);
      fetchNotices();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete notice' });
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Examination':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Academic':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Event':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Holiday':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Notice Board
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official circulars, academic calendar updates, and examination guidelines
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => {
              setSelectedNotice(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Publish Notice
          </button>
        )}
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-7 h-7 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
          Loading notices...
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {notices.map((n) => {
            const isAuthor = n.author?._id === user?._id || role === 'admin';
            return (
              <div
                key={n._id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  n.isPinned
                    ? 'border-blue-200 bg-gradient-to-br from-blue-50/30 to-white'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(
                          n.category
                        )}`}
                      >
                        {n.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        For: {n.targetAudience}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {n.isPinned && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Pin className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Pinned
                        </div>
                      )}

                      {isAuthor && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedNotice(n);
                              setFormOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(n._id);
                              setConfirmOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {n.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {n.content}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{n.author?.name || 'Administrator'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">No Notices Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            There are no announcements matching your selected category.
          </p>
        </div>
      )}

      {/* Notice Form Modal */}
      <NoticeFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveNotice}
        notice={selectedNotice}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteNotice}
        title="Remove Notice"
        message="Are you sure you want to permanently delete this announcement from the campus notice board?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default NoticesPage;
