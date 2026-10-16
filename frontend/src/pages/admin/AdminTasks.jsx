import { useState, useEffect } from 'react';
import { Gamepad2, Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ gameTitle: '', reward: '' });
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/admin/tasks');
      setTasks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSave = async () => {
    if (!formData.gameTitle || !formData.reward) return;
    setSaving(true);
    try {
      if (editingTask) {
        await api.put(`/api/admin/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/api/admin/tasks', { ...formData, reward: Number(formData.reward) });
      }
      setShowForm(false);
      setEditingTask(null);
      setFormData({ gameTitle: '', reward: '' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'خطا');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این تسک اطمینان دارید؟')) return;
    try {
      await api.delete(`/api/admin/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('خطا در حذف');
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({ gameTitle: task.gameTitle, reward: task.reward });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }
  const { isRtl } = useLanguage();

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          مدیریت تسک‌ها
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditingTask(null); setFormData({ gameTitle: '', reward: '' }); }}
          className="bg-gradient-to-l from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          تسک جدید
        </button>
      </div>

      {/* فرم */}
      {showForm && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-medium mb-4">{editingTask ? 'ویرایش تسک' : 'تسک جدید'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="عنوان بازی"
              value={formData.gameTitle}
              onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
              className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
            <input
              type="number"
              placeholder="مبلغ پاداش (تومان)"
              value={formData.reward}
              onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
              className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
              dir="ltr"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              ذخیره
            </button>
            <button onClick={() => { setShowForm(false); setEditingTask(null); }} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
              <X className="w-4 h-4" />
              لغو
            </button>
          </div>
        </div>
      )}

      {/* لیست */}
      {tasks.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-12 text-center">
          <p className="text-gray-500">هنوز تسکی ساخته نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task._id} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{task.gameTitle}</h3>
                <p className="text-cyan-400 text-sm mt-1">{task.reward?.toLocaleString('fa-IR')} تومان</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(task)} className="p-2.5 rounded-xl bg-gray-700/50 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(task._id)} className="p-2.5 rounded-xl bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
