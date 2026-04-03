import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, UserPlus, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, getStudents } from '../services/cmsService';

const EMPTY_COURSE = { courseName: '', courseCode: '', credits: 3, department: '', semester: 1, description: '' };

const Courses = () => {
  const [courses, setCourses]   = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // 'create' | 'edit' | 'enroll'
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_COURSE);
  const [enrollForm, setEnrollForm] = useState({ studentId: '', courseId: '' });
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([getCourses(), getStudents({ limit: 200 })]);
      // paginatedResponse: { data: [] }
      setCourses(c.data?.data ?? c.data ?? []);
      setStudents(s.data?.data ?? s.data ?? []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = ()  => { setEditing(null); setForm(EMPTY_COURSE); setModal('create'); };
  const openEdit   = (c) => { setEditing(c); setForm({ ...c }); setModal('edit'); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseName || !form.courseCode || !form.department) {
      return toast.error('Course name, code and department are required');
    }
    setSaving(true);
    try {
      if (editing) {
        await updateCourse(editing.id, form);
        toast.success('Course updated');
      } else {
        await createCourse(form);
        toast.success('Course created');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!enrollForm.studentId || !enrollForm.courseId) return toast.error('Select student and course');
    setSaving(true);
    try {
      // Backend route: POST /courses/:courseId/enroll  with body { studentId }
      await enrollStudent(enrollForm.courseId, { studentId: enrollForm.studentId });
      toast.success('Student enrolled successfully');
      setModal(null);
      setEnrollForm({ studentId: '', courseId: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'courseCode', label: 'Code',
      render: (row) => (
        <span className="font-mono text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg">
          {row.courseCode}
        </span>
      ),
    },
    {
      key: 'courseName', label: 'Course Name',
      render: (row) => <span className="font-medium text-slate-800 dark:text-white">{row.courseName}</span>,
    },
    { key: 'department', label: 'Department' },
    {
      key: 'credits', label: 'Credits',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          {row.credits} cr
        </span>
      ),
    },
    {
      key: 'semester', label: 'Semester',
      render: (row) => `Sem ${row.semester}`,
    },
    {
      key: 'isActive', label: 'Status',
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 transition" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-800 transition" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="text-purple-500" size={26} /> Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {courses.length} active course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal('enroll')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            <UserPlus size={16} /> Enroll Student
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all shadow-md shadow-purple-600/20"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      <Table columns={columns} data={courses} loading={loading} />

      {/* Create/Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={editing ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'courseName',  label: 'Course Name',  placeholder: 'Data Structures & Algorithms', col2: true },
              { name: 'courseCode',  label: 'Course Code',  placeholder: 'CS301' },
              { name: 'department',  label: 'Department',   placeholder: 'Computer Science' },
              { name: 'credits',     label: 'Credits',      placeholder: '4', type: 'number' },
              { name: 'description', label: 'Description',  placeholder: 'Course overview…', col2: true },
            ].map((f) => (
              <div key={f.name} className={f.col2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  name={f.name}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Semester</label>
              <select
                name="semester"
                value={form.semester || 1}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-md shadow-purple-600/20">
              {saving ? 'Saving…' : editing ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Modal */}
      <Modal open={modal === 'enroll'} onClose={() => setModal(null)} title="Enroll Student in Course">
        <form onSubmit={handleEnroll} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Student</label>
            <select
              value={enrollForm.studentId}
              onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
              value={enrollForm.courseId}
              onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all disabled:opacity-60 shadow-md shadow-purple-600/20">
              {saving ? 'Enrolling…' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;
