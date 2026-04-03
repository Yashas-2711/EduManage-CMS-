import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/cmsService';
import { setToken } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const { data } = await login(form);
      const token = data?.data?.token || data?.token;
      const user = data?.data?.user || data?.user;
      
      setToken(token);
      localStorage.setItem('cms_user', JSON.stringify(user));
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-3xl bg-blue-500 mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">EduManage CMS</h1>
          <p className="text-blue-200 text-lg max-w-sm">
            The complete College Management System for modern institutions.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto text-left">
            {['Student Records', 'Fee Tracking', 'Attendance', 'Marks & Grades'].map((f) => (
              <div key={f} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-white text-sm font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex flex-1 lg:max-w-md items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white">EduManage CMS</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@college.edu"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
