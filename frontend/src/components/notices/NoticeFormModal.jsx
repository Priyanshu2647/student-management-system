import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const NoticeFormModal = ({
  isOpen,
  onClose,
  onSave,
  notice = null,
  isLoading = false,
}) => {
  const isEdit = !!notice;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All',
    priority: 'Medium',
    isPinned: false,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        content: notice.content || '',
        category: notice.category || 'General',
        targetAudience: notice.targetAudience || 'All',
        priority: notice.priority || 'Medium',
        isPinned: !!notice.isPinned,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'General',
        targetAudience: 'All',
        priority: 'Medium',
        isPinned: false,
      });
    }
    setError('');
  }, [notice, isOpen]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and notice content are required.');
      return;
    }

    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Notice Announcement' : 'Publish College Announcement'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notice Title *
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Mid-Term Examination Timetable"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="General">General</option>
              <option value="Academic">Academic</option>
              <option value="Examination">Examination</option>
              <option value="Event">Event</option>
              <option value="Holiday">Holiday</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Audience
            </label>
            <select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="All">All Campus</option>
              <option value="Student">Students Only</option>
              <option value="Teacher">Faculty Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notice Details & Announcement Content *
          </label>
          <textarea
            name="content"
            rows="5"
            placeholder="Write the full announcement details here..."
            value={formData.content}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          ></textarea>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPinned"
            name="isPinned"
            checked={formData.isPinned}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="isPinned" className="text-xs font-medium text-slate-700 cursor-pointer">
            Pin notice to top of the Notice Board
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            {isLoading ? 'Publishing...' : isEdit ? 'Update Notice' : 'Publish Notice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoticeFormModal;
