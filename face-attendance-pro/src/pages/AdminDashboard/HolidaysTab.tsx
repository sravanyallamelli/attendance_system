import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, Trash2, Gift } from 'lucide-react';
import { Holiday } from '../../types';

interface HolidaysTabProps {
  holidays: Holiday[];
  onAdd: (h: Partial<Holiday>) => void;
  onDelete: (id: number) => void;
}

export const HolidaysTab: React.FC<HolidaysTabProps> = ({ holidays, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'public' as 'public' | 'company' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newHoliday);
    setNewHoliday({ name: '', date: '', type: 'public' });
    setShowForm(false);
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-200"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-zinc-400" />
          <h2 className="font-bold text-xl">Holiday Calendar</h2>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Holiday
        </button>
      </div>

      {showForm && (
        <motion.form 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          onSubmit={handleSubmit} 
          className="mb-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Holiday Name</label>
              <input 
                type="text" 
                value={newHoliday.name}
                onChange={e => setNewHoliday({...newHoliday, name: e.target.value})}
                className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 font-medium text-sm"
                placeholder="e.g. Diwali"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Date</label>
              <input 
                type="date" 
                value={newHoliday.date}
                onChange={e => setNewHoliday({...newHoliday, date: e.target.value})}
                className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Type</label>
              <select 
                value={newHoliday.type}
                onChange={e => setNewHoliday({...newHoliday, type: e.target.value as 'public' | 'company'})}
                className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 font-medium text-sm"
              >
                <option value="public">Public Holiday</option>
                <option value="company">Company Holiday</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-zinc-500">Cancel</button>
            <button type="submit" className="bg-zinc-900 text-white px-6 py-2 rounded-xl text-sm font-bold">Save Holiday</button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map(h => (
          <div key={h.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${h.type === 'public' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">{h.name}</p>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onDelete(h.id)}
              className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {holidays.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-zinc-400 text-sm font-medium">No holidays scheduled yet</p>
          </div>
        )}
      </div>
    </motion.section>
  );
};
