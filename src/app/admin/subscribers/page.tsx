"use client";

import { useEffect, useState } from "react";
import { getSubscribers } from "../actions";
import { Loader2, Mail, Phone, Ghost, Clock } from "lucide-react";

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscribers() {
      const data = await getSubscribers();
      setSubscribers(data);
      setLoading(false);
    }
    fetchSubscribers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-white">Subscribers</h2>
          <p className="text-stone-500 text-sm mt-1">Manage newsletter signups and private members</p>
        </div>
        <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Total Subscribers</span>
          <span className="text-lg font-bold text-stone-900 dark:text-white">{subscribers.length}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Socials</th>
                <th className="px-5 py-3 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-900 dark:text-stone-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-stone-900 dark:text-white">
                        <Mail size={14} className="text-stone-400" />
                        {sub.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {sub.whatsapp_number && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 w-fit px-2 py-0.5 rounded-md">
                          <Phone size={12} />
                          {sub.whatsapp_number}
                        </div>
                      )}
                      {sub.snapchat && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-900/50 w-fit px-2 py-0.5 rounded-md">
                          <Ghost size={12} />
                          {sub.snapchat}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-500 text-xs text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock size={12} />
                      {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-stone-500">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
