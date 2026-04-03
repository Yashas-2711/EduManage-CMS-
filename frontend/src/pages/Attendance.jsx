import { useState, useEffect, useCallback } from 'react';
import { Plus, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getAttendance, markAttendance, getStudents, getCourses } from '../services/cmsService';

const statusColors = {
  present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  absent:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  late:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  excused: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const Attendance = () => {
  const [records, setRecords]   = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]         = useState({
    studentId: '', courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present', remarks: '',
  });
  const [saving, setSaving]     = useState(false);
  const [filterDate, setFilterDate]   = useState('');
  const [filterStudentId, setFilterStudentId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        getStudents({ limit: 200 }),
        getCourses({ limit: 200 }),
      ]);
      const studentsData = s.data?.data ?? s.data ?? [];
      const coursesData  = c.data?.data ?? c.data ?? [];
      setStudents(studentsData);
      setCourses(coursesData);

      // Fetch attendance: use student-based route if filtered, else all records per student
      if (filterStudentId) {
        const params = {};
        if (filterDate) params.startDate = filterDate;
        if (filterDate) params.endDate   = filterDate;
        const a = await getAttendance(filterStudentId, params);
        setRecords(a.data?.data ?? a.data ?? []);
      } else {
        // Load attendance records for the first student or all in batches
        // Since backend doesn't have a global GET /attendance, we aggregate
        setRecords([]);
      }
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStudentId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.courseId || !form.date) return toast.error('All fields required');
    setSaving(true);
    try {
      await markAttendance(form);
      toast.success('Attendance marked');
      setModalOpen(false);
      // Refresh if we're viewing student's attendance
      if (filterStudentId === form.studentId) load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking attendance');
    } finally {
      setSaving(false);
    }
  };

  // Summary by status
  const summary = records.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    { present: 0, absent: 0, late: 0, excused: 0 }
  );
  const total = records.length;
  const rate  = total ? Math.round(((summary.present + summary.late) / total) * 100) : 0;

  const columns = [
    {
      key: 'student', label: 'Student',
      render: (row) => {
        const s = students.find((st) => st.id === (row.studentId ?? row.Student?.id));
        const name = s ? `${s.firstName} ${s.lastName}` : (row.Student ? `${row.Student.firstName} ${row.Student.lastName}` : '—');
        return <span className="font-medium text-slate-800 dark:text-white">{name}</span>;
      },
    },
    {
      key: 'course', label: 'Course',
      render: (row) => {
        const c = courses.find((co) => co.id === (row.courseId ?? row.Course?.id));
        return c?.courseName ?? row.Course?.courseName ?? '—';
      },
    },
    {
      key: 'date', label: 'Date',
      render: (row) => row.date ? new Date(row.date).toLocaleDateString('en-IN') : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[row.status] ?? ''}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'remarks', label: 'Remarks',
      render: (row) => <span className="text-xs text-slate-400">{row.remarks || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarCheck className="text-amber-500" size={26} /> Attendance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Track and manage student attendance</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all shadow-md shadow-amber-500/20 self-start sm:self-auto"
        >
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      {/* Summary cards */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total',   value: total,           color: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200' },
            { label: 'Present', value: summary.present, color: 'bg-green-50 dark:bg-green-900/20 text-green-700' },
            { label: 'Absent',  value: summary.absent,  color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
            { label: 'Rate',    value: `${rate}%`,      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 border border-slate-100 dark:border-slate-700 ${s.color}`}>
              <p className="text-xs font-medium opacity-70 mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Student</label>
          <select
            value={filterStudentId}
            onChange={(e) => { setFilterStudentId(e.target.value); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          >
            <option value="">Select a student to view attendance</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.rollNumber}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
        </div>
        {(filterDate || filterStudentId) && (
          <button
            onClick={() => { setFilterDate(''); setFilterStudentId(''); }}
            className="mt-5 text-sm text-amber-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {!filterStudentId && (
        <div className="text-center py-10 text-slate-400 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <CalendarCheck size={32} className="mx-auto mb-2 opacity-30" />
          <p>Select a student above to view their attendance records.</p>
        </div>
      )}

      {filterStudentId && (
        <Table columns={columns} data={records} loading={loading} />
      )}

      {/* Mark Attendance Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Mark Attendance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Remarks (optional)</label>
            <input
              type="text"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Medical leave, etc."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-md shadow-amber-500/20">
              {saving ? 'Saving…' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
