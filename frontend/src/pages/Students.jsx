import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/cmsService';

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '',
  rollNumber: '', department: '', semester: 1,
  admissionYear: new Date().getFullYear(),
  gender: '', dateOfBirth: '',
};

const Students = () => {
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getStudents({ page, search, limit: 10 });
      // paginatedResponse: { success, pagination: { totalPages, total }, data: [] }
      setStudents(data.data ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = (s) => { setEditing(s); setForm({ ...s }); setModalOpen(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.rollNumber || !form.department) {
      return toast.error('First name, email, roll number and department are required');
    }
    setSaving(true);
    try {
      if (editing) {
        await updateStudent(editing.id, form);
        toast.success('Student updated');
      } else {
        await createStudent(form);
        toast.success('Student added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deleted');
      load();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  const columns = [
    {
      key: 'roll', label: 'Roll No.',
      render: (row) => <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">{row.rollNumber}</span>,
    },
    {
      key: 'name', label: 'Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <span className="font-medium text-slate-800 dark:text-white">{row.firstName} {row.lastName}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    { key: 'department', label: 'Department' },
    {
      key: 'semester', label: 'Sem.',
      render: (row) => <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">{row.semester}</span>,
    },
    {
      key: 'isActive', label: 'Status',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 transition"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-800 transition"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const formFields = [
    { name: 'firstName',     label: 'First Name',      placeholder: 'John',        type: 'text',   col2: false },
    { name: 'lastName',      label: 'Last Name',        placeholder: 'Doe',         type: 'text',   col2: false },
    { name: 'email',         label: 'Email',            placeholder: 'john@uni.edu',type: 'email',  col2: true  },
    { name: 'rollNumber',    label: 'Roll Number',      placeholder: 'CS2024001',   type: 'text',   col2: false },
    { name: 'department',    label: 'Department',       placeholder: 'Computer Science', type: 'text', col2: false },
    { name: 'phone',         label: 'Phone',            placeholder: '9876543210',  type: 'tel',    col2: false },
    { name: 'dateOfBirth',   label: 'Date of Birth',    placeholder: '',            type: 'date',   col2: false },
    { name: 'admissionYear', label: 'Admission Year',   placeholder: '2024',        type: 'number', col2: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserCircle className="text-blue-500" size={26} /> Students
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {total} student{total !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 self-start sm:self-auto"
        >
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email or roll number…"
          className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={students}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Student' : 'Add New Student'}
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {formFields.map((f) => (
              <div key={f.name} className={f.col2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            ))}

            {/* Semester */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Semester</label>
              <select
                name="semester"
                value={form.semester || 1}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender || ''}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-md shadow-blue-600/20"
            >
              {saving ? 'Saving…' : editing ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
