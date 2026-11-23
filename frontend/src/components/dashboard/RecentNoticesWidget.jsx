import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Pin, ArrowRight } from 'lucide-react';

const RecentNoticesWidget = ({ notices = [] }) => {
  const getCategoryColor = (cat) => {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">College Notices</h3>
          </div>
          <Link
            to="/notices"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {notices && notices.length > 0 ? (
            notices.slice(0, 5).map((n) => (
              <div
                key={n._id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryColor(
                      n.category
                    )}`}
                  >
                    {n.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    {n.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 hover:text-blue-600">
                  {n.title}
                </h4>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">
              No recent college announcements.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <Link
          to="/notices"
          className="w-full block text-center py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-colors"
        >
          Open Notice Board
        </Link>
      </div>
    </div>
  );
};

export default RecentNoticesWidget;
