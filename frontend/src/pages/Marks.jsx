import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getMarks, createMark, updateMark, deleteMark, getStudents, getCourses } from '../services/cmsService';

const EMPTY = { studentId: '', courseId: '', examType: 'internal', marksObtained: '', maxMarks: 100, examDate: '', remarks: '' };

const examTypeOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'practical', label: 'Practical' },
  { value: 'assignment', label: 'Assignment' },
];

const Marks = () => {
  const [marks, setMarks]       = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, s, c] = await Promise.all([
        getMarks({ page }),
        getStudents({ limit: 200 }),
        getCourses({ limit: 200 }),
      ]);
      setMarks(m.data?.data ?? m.data ?? []);
      setTotalPages(m.data?.pagination?.totalPages ?? 1);
      setStudents(s.data?.data ?? s.data ?? []);
      setCourses(c.data?.data ?? c.data ?? []);
    } catch {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = (m) => {
    setEditing(m);
    setForm({
      studentId: m.studentId ?? m.student?.id ?? '',
      courseId: m.courseId ?? m.course?.id ?? '',
      examType: m.examType || 'internal',
      marksObtained: m.marksObtained ?? '',
      maxMarks: m.maxMarks ?? 100,
      examDate: m.examDate || '',
      remarks: m.remarks || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.courseId || form.marksObtained === '') {
      return toast.error('Student, course and marks are required');
    }
    setSaving(true);
    try {
      if (editing) {
        await updateMark(editing.id, form);
        toast.success('Marks updated');
      } else {
        await createMark(form);
        toast.success('Marks added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving marks');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteMark(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const gradeColor = (grade) => {
    const map = {
      'A+': 'bg-emerald-100 text-emerald-700',
      'A':  'bg-green-100 text-green-700',
      'B+': 'bg-blue-100 text-blue-700',
      'B':  'bg-blue-50 text-blue-600',
      'C':  'bg-yellow-100 text-yellow-700',
      'D':  'bg-orange-100 text-orange-700',
      'F':  'bg-red-100 text-red-600',
    };
    return map[grade] || 'bg-slate-100 text-slate-600';
  };

  const columns = [
    {
      key: 'student', label: 'Student',
      render: (row) => {
        const s = students.find((st) => st.id === (row.studentId ?? row.student?.id));
        const name = s ? `${s.firstName} ${s.lastName}` : (row.student ? `${row.student.firstName} ${row.student.lastName}` : '—');
        return (
          <div>
            <p className="font-medium text-slate-800 dark:text-white text-sm">{name}</p>
            {s?.rollNumber && <p className="text-xs text-slate-400 font-mono">{s.rollNumber}</p>}
          </div>
        );
      },
    },
    {
      key: 'course', label: 'Course',
      render: (row) => {
        const c = courses.find((co) => co.id === (row.courseId ?? row.course?.id));
        return c?.courseName ?? row.course?.courseName ?? '—';
      },
    },
    {
      key: 'examType', label: 'Exam Type',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
          {row.examType}
        </span>
      ),
    },
    {
      key: 'marksObtained', label: 'Marks',
      render: (row) => `${row.marksObtained} / ${row.maxMarks}`,
    },
    {
      key: 'percentage', label: '%',
      render: (row) => {
        const pct = parseFloat(row.percentage ?? ((row.marksObtained / row.maxMarks) * 100).toFixed(1));
        const color = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
        return <span className={`font-semibold ${color}`}>{pct}%</span>;
      },
    },
    {
      key: 'grade', label: 'Grade',
      render: (row) => row.grade ? (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeColor(row.grade)}`}>{row.grade}</span>
      ) : '—',
    },
    { key: 'examDate', label: 'Date', render: (row) => row.examDate ? new Date(row.examDate).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 transition"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-green-500" size={26} /> Marks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">View and manage student grades</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all shadow-md shadow-green-600/20 self-start sm:self-auto"
        >
          <Plus size={16} /> Add Marks
        </button>
      </div>

      <Table columns={columns} data={marks} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Marks Record' : 'Add Marks Record'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.rollNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Course</label>
            <select
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Exam Type</label>
            <select
              value={form.examType}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              {examTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Marks Obtained</label>
              <input
                type="number"
                value={form.marksObtained}
                onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
                min={0}
                max={form.maxMarks}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Max Marks</label>
              <input
                type="number"
                value={form.maxMarks}
                onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                min={1}
                placeholder="100"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Exam Date</label>
              <input
                type="date"
                value={form.examDate}
                onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Remarks</label>
              <input
                type="text"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Optional note"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          {/* Live percentage preview */}
          {form.marksObtained !== '' && form.maxMarks && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex justify-between items-center text-sm border border-green-100 dark:border-green-800">
              <span className="text-slate-500 dark:text-slate-400">Preview:</span>
              <span className="font-semibold text-green-700 dark:text-green-300">
                {Number(form.marksObtained)} / {Number(form.maxMarks)} = {((Number(form.marksObtained) / Number(form.maxMarks)) * 100).toFixed(1)}%
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-md shadow-green-600/20">
              {saving ? 'Saving…' : editing ? 'Update Marks' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Marks;
