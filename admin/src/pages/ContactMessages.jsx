import { useState, useEffect } from 'react';
import { HiOutlineMail, HiOutlinePhone, HiOutlineClock } from 'react-icons/hi';
import { adminService } from '../services/adminService';
import { formatDateTime } from '../utils/helpers';

export const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getContactMessages()
      .then((res) => setMessages(res.data?.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Support & Inquiries</h1>
        <p className="text-sm text-slate-500">Contact form submissions from visitors and buyers.</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Loading inquiries...
          </div>
        ) : messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {m.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{m.email}</span>
                      {m.phone && <span>• {m.phone}</span>}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <HiOutlineClock className="w-3.5 h-3.5" />
                  {formatDateTime(m.createdAt)}
                </span>
              </div>
              {m.subject && <p className="text-xs font-semibold text-slate-700 pt-1">Subject: {m.subject}</p>}
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {m.message}
              </p>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No contact inquiries received.
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessages;
