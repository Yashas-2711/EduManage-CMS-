import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, CreditCard, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getFees, createFee, updateFee, getStudents } from '../services/cmsService';

const EMPTY = {
  studentId: '', feeType: 'tuition', totalAmount: '', paidAmount: 0,
  dueDate: '', semester: '', academicYear: '', remarks: '',
};

const statusColors = {
  paid:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  overdue: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const feeTypeOptions = ['tuition', 'hostel', 'library', 'exam', 'other'];

const Fees = () => {
  const [fees, setFees]         = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const [f, s] = await Promise.all([getFees(params), getStudents({ limit: 200 })]);
      setFees(f.data?.data ?? f.data ?? []);
      setTotalPages(f.data?.pagination?.totalPages ?? 1);
      setStudents(s.data?.data ?? s.data ?? []);
    } catch {
      toast.error('Failed to load fee records');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = (f) => { setEditing(f); setForm({ ...f }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.totalAmount) return toast.error('Student and total amount are required');
    setSaving(true);
    try {
      if (editing) {
        await updateFee(editing.id, form);
        toast.success('Fee record updated');
      } else {
        await createFee(form);
        toast.success('Fee record added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  // Compute totals for summary
  const totalAmount  = fees.reduce((s, f) => s + parseFloat(f.totalAmount || 0), 0);
  const totalPaid    = fees.reduce((s, f) => s + parseFloat(f.paidAmount || 0), 0);
  const totalPending = totalAmount - totalPaid;

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
      key: 'feeType', label: 'Type',
      render: (row) => <span className="capitalize text-sm">{row.feeType}</span>,
    },
    {
      key: 'totalAmount', label: 'Total',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-white">₹{Number(row.totalAmount || 0).toLocaleString()}</span>,
    },
    {
      key: 'paidAmount', label: 'Paid',
      render: (row) => <span className="font-semibold text-green-600">₹{Number(row.paidAmount || 0).toLocaleString()}</span>,
    },
    {
      key: 'pendingAmount', label: 'Pending',
      render: (row) => {
        const pending = parseFloat(row.totalAmount || 0) - parseFloat(row.paidAmount || 0);
        return <span className={`font-semibold ${pending > 0 ? 'text-red-500' : 'text-slate-400'}`}>₹{pending.toLocaleString()}</span>;
      },
    },
    {
      key: 'dueDate', label: 'Due Date',
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-IN') : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[row.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 transition" title="Edit">
          <Pencil size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="text-emerald-500" size={26} /> Fees
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Track student fee payments</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all shadow-md shadow-emerald-600/20 self-start sm:self-auto"
        >
          <Plus size={16} /> Add Fee Record
        </button>
      </div>

      {/* Summary strip */}
      {fees.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Billed', value: `₹${totalAmount.toLocaleString()}`, color: 'text-slate-700 dark:text-slate-200' },
            { label: 'Total Paid',   value: `₹${totalPaid.toLocaleString()}`,   color: 'text-green-600' },
            { label: 'Pending',      value: `₹${totalPending.toLocaleString()}`, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'paid', 'partial', 'pending', 'overdue'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filterStatus === s
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <Table columns={columns} data={fees} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Fee Record' : 'Add Fee Record'} width="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.rollNumber}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fee Type</label>
              <select
                value={form.feeType}
                onChange={(e) => setForm({ ...form, feeType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              >
                {feeTypeOptions.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Academic Year</label>
              <input
                type="text"
                value={form.academicYear || ''}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                placeholder="2024-25"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Total Amount (₹)</label>
              <input
                type="number"
                value={form.totalAmount || ''}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                placeholder="50000"
                min={0}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Paid Amount (₹)</label>
              <input
                type="number"
                value={form.paidAmount || 0}
                onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                placeholder="0"
                min={0}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate || ''}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Semester</label>
              <select
                value={form.semester || ''}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              >
                <option value="">Select semester</option>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Remarks</label>
            <input
              type="text"
              value={form.remarks || ''}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Optional remarks"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Live pending preview */}
          {form.totalAmount && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 flex justify-between items-center text-sm border border-emerald-100 dark:border-emerald-800">
              <span className="text-slate-500 dark:text-slate-400">Balance due:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                ₹{Math.max(0, Number(form.totalAmount) - Number(form.paidAmount || 0)).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-md shadow-emerald-600/20">
              {saving ? 'Saving…' : editing ? 'Update Record' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;
