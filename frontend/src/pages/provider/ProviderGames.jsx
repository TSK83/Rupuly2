import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Plus, Pencil, Trash2, CheckCircle2, Eye, Loader2, X, Check, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';

export default function ProviderGames() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', gameUrl: '', timeMode: 'continuous' });
  const [saving, setSaving] = useState(false);

  // ── مدیریت تکالیف ────────────────────
  const [selectedGame, setSelectedGame] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', type: 'main', reward: '', timeLimitDays: '', paymentWaitDays: '' });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const fetchGames = async () => {
    try {
      const { data } = await api.get('/api/provider/games');
      setGames(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGames(); }, []);

  const fetchAssignments = async (gameId) => {
    try {
      const { data } = await api.get(`/api/provider/games/${gameId}/assignments`);
      setAssignments(data.data);
    } catch (err) { console.error(err); }
  };

  // ── CRUD بازی ────────────────────
  const handleSaveGame = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (editingGame) {
        await api.put(`/api/provider/games/${editingGame._id}`, form);
      } else {
        await api.post('/api/provider/games', form);
      }
      setShowForm(false);
      setEditingGame(null);
      setForm({ title: '', description: '', gameUrl: '', timeMode: 'continuous' });
      fetchGames();
    } catch (err) { alert(err.response?.data?.message || 'خطا'); }
    finally { setSaving(false); }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('آیا از حذف این بازی اطمینان دارید؟')) return;
    try { await api.delete(`/api/provider/games/${id}`); fetchGames(); if (selectedGame?._id === id) setSelectedGame(null); }
    catch (err) { alert('خطا در حذف'); }
  };

  const handleConfirmGame = async (id) => {
    if (!confirm('بعد از تایید نهایی امکان ویرایش وجود ندارد. ادامه می‌دهید؟')) return;
    try {
      await api.post(`/api/provider/games/${id}/confirm`);
      fetchGames();
      if (selectedGame?._id === id) setSelectedGame({ ...selectedGame, status: 'confirmed' });
    } catch (err) { alert(err.response?.data?.message || 'خطا'); }
  };

  // ── CRUD تکلیف ────────────────────
  const handleSaveAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.reward || !assignmentForm.timeLimitDays) return;
    setSavingAssignment(true);
    try {
      const payload = {
        ...assignmentForm,
        reward: Number(assignmentForm.reward),
        timeLimitDays: Number(assignmentForm.timeLimitDays),
        paymentWaitDays: assignmentForm.paymentWaitDays ? Number(assignmentForm.paymentWaitDays) : null,
      };
      if (editingAssignment) {
        await api.put(`/api/provider/assignments/${editingAssignment._id}`, payload);
      } else {
        await api.post(`/api/provider/games/${selectedGame._id}/assignments`, payload);
      }
      setShowAssignmentForm(false);
      setEditingAssignment(null);
      setAssignmentForm({ title: '', type: 'main', reward: '', timeLimitDays: '', paymentWaitDays: '' });
      fetchAssignments(selectedGame._id);
    } catch (err) { alert(err.response?.data?.message || 'خطا'); }
    finally { setSavingAssignment(false); }
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm('حذف تکلیف؟')) return;
    try { await api.delete(`/api/provider/assignments/${id}`); fetchAssignments(selectedGame._id); }
    catch (err) { alert('خطا'); }
  };

  const selectGame = (game) => {
    setSelectedGame(game);
    fetchAssignments(game._id);
  };

  const typeLabels = { main: 'اصلی', bonus: 'تشویقی', daily: 'روزمره' };
  const typeColors = { main: 'text-purple-400 bg-purple-500/10', bonus: 'text-cyan-400 bg-cyan-500/10', daily: 'text-green-400 bg-green-500/10' };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-orange-500 animate-spin" /></div>;
  const { isRtl } = useLanguage();

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* هدر */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-orange-400" />
          بازی‌های من
        </h2>
        <button onClick={() => { setShowForm(true); setEditingGame(null); setForm({ title: '', description: '', gameUrl: '', timeMode: 'continuous' }); }}
          className="bg-gradient-to-l from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> بازی جدید
        </button>
      </div>

      {/* فرم بازی */}
      {showForm && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-medium mb-4">{editingGame ? 'ویرایش بازی' : 'بازی جدید'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="نام بازی *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
            <input type="text" placeholder="لینک بازی (اختیاری)" value={form.gameUrl} onChange={(e) => setForm({ ...form, gameUrl: e.target.value })} dir="ltr"
              className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
          </div>
          <textarea placeholder="توضیحات (اختیاری)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
            className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all mb-4" />
          <div className="mb-4">
            <label className="text-gray-300 text-sm mb-3 block">حالت زمان‌بندی تکالیف</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* پیوسته */}
              <button type="button" onClick={() => setForm({ ...form, timeMode: 'continuous' })}
                className={`text-right p-4 rounded-xl border transition-all ${
                  form.timeMode === 'continuous'
                    ? 'bg-orange-600/15 border-orange-500/40 ring-1 ring-orange-500/20'
                    : 'bg-gray-800/40 border-gray-700/40 hover:border-gray-600/50'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${form.timeMode === 'continuous' ? 'text-orange-400' : 'text-gray-300'}`}>⏳ پیوسته</span>
                </div>
                <p className="text-gray-300 text-xs leading-5">
                  تکالیف به ترتیب باز می‌شوند. اگر کاربر زودتر تمام کند، زمان اضافه به تکلیف بعدی اضافه می‌شود.
                </p>
                <p className="text-amber-400/70 text-xs mt-2 italic">
                  مثال: تکلیف ۱ (۲ روز) → اگر در ۱ روز تمام شد → ۱ روز اضافه به تکلیف ۲
                </p>
              </button>

              {/* آنی */}
              <button type="button" onClick={() => setForm({ ...form, timeMode: 'instant' })}
                className={`text-right p-4 rounded-xl border transition-all ${
                  form.timeMode === 'instant'
                    ? 'bg-orange-600/15 border-orange-500/40 ring-1 ring-orange-500/20'
                    : 'bg-gray-800/40 border-gray-700/40 hover:border-gray-600/50'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${form.timeMode === 'instant' ? 'text-orange-400' : 'text-gray-300'}`}>⚡ آنی</span>
                </div>
                <p className="text-gray-300 text-xs leading-5">
                  تمام تایمرها همزمان با نصب بازی شروع می‌شوند. هر تکلیف باید حداقل ۱ روز بیشتر از قبلی باشد.
                </p>
                <p className="text-amber-400/70 text-xs mt-2 italic">
                  مثال: تکلیف ۱ (۱ روز) → تکلیف ۲ (۲ روز) → تکلیف ۳ (۳ روز) — همه از لحظه نصب
                </p>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveGame} disabled={saving} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} ذخیره
            </button>
            <button onClick={() => { setShowForm(false); setEditingGame(null); }} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
              <X className="w-4 h-4" /> لغو
            </button>
          </div>
        </div>
      )}

      {/* لیست بازی‌ها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {games.map(game => (
          <div key={game._id}
            className={`bg-gray-800/40 border rounded-2xl p-5 cursor-pointer transition-all ${
              selectedGame?._id === game._id ? 'border-orange-500/40' : 'border-gray-700/40 hover:border-orange-500/20'
            }`}
            onClick={() => selectGame(game)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">{game.title}</h3>
              <span className={`text-xs px-3 py-1 rounded-full border ${
                game.status === 'confirmed'
                  ? 'text-green-400 bg-green-500/10 border-green-500/25'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
              }`}>
                {game.status === 'confirmed' ? 'تایید شده' : 'پیش‌نویس'}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{game.timeMode === 'continuous' ? 'پیوسته' : 'آنی'}</p>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {game.status === 'draft' && (
                <>
                  <button onClick={() => { setEditingGame(game); setForm({ title: game.title, description: game.description, gameUrl: game.gameUrl || '', timeMode: game.timeMode }); setShowForm(true); }}
                    className="p-2 rounded-lg bg-gray-700/50 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleConfirmGame(game._id)}
                    className="p-2 rounded-lg bg-gray-700/50 hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                </>
              )}
              <button onClick={() => handleDeleteGame(game._id)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* تکالیف بازی انتخاب شده */}
      {selectedGame && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">تکالیف «{selectedGame.title}»</h3>
            {selectedGame.status === 'draft' && (
              <button onClick={() => { setShowAssignmentForm(true); setEditingAssignment(null); setAssignmentForm({ title: '', type: 'main', reward: '', timeLimitDays: '', paymentWaitDays: '' }); }}
                className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> تکلیف جدید
              </button>
            )}
          </div>

          {showAssignmentForm && (
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input type="text" placeholder="عنوان تکلیف *" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-2.5 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
                <select value={assignmentForm.type} onChange={(e) => setAssignmentForm({ ...assignmentForm, type: e.target.value })}
                  className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-all">
                  <option value="main">اصلی</option>
                  <option value="bonus">تشویقی</option>
                  <option value="daily">روزمره</option>
                </select>
                <input type="number" placeholder="پاداش (تومان) *" value={assignmentForm.reward} onChange={(e) => setAssignmentForm({ ...assignmentForm, reward: e.target.value })} dir="ltr"
                  className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-2.5 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
                <input type="number" placeholder="محدودیت زمانی (روز) *" value={assignmentForm.timeLimitDays} onChange={(e) => setAssignmentForm({ ...assignmentForm, timeLimitDays: e.target.value })} dir="ltr"
                  className="bg-gray-900/70 border border-gray-600/50 rounded-xl py-2.5 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
              </div>
              {Number(assignmentForm.reward) >= 200000 && (
                <input type="number" placeholder="زمان انتظار پرداخت (۱ تا ۳۰ روز) *" value={assignmentForm.paymentWaitDays} onChange={(e) => setAssignmentForm({ ...assignmentForm, paymentWaitDays: e.target.value })} dir="ltr"
                  className="w-full bg-gray-900/70 border border-gray-600/50 rounded-xl py-2.5 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all mb-3" />
              )}
              <div className="flex gap-2">
                <button onClick={handleSaveAssignment} disabled={savingAssignment} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  {savingAssignment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} ذخیره
                </button>
                <button onClick={() => setShowAssignmentForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-xl"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {assignments.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-8 text-center">
              <p className="text-gray-500">هنوز تکلیفی اضافه نشده</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a, i) => (
                <div key={a._id} className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm font-mono w-6">{i + 1}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${typeColors[a.type]}`}>{typeLabels[a.type]}</span>
                        <span className="text-cyan-400">{a.reward?.toLocaleString('fa-IR')} تومان</span>
                        <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{a.timeLimitDays} روز</span>
                      </div>
                    </div>
                  </div>
                  {selectedGame.status === 'draft' && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingAssignment(a); setAssignmentForm({ title: a.title, type: a.type, reward: a.reward, timeLimitDays: a.timeLimitDays, paymentWaitDays: a.paymentWaitDays || '' }); setShowAssignmentForm(true); }}
                        className="p-2 rounded-lg hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteAssignment(a._id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
