import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_API, apiRequest } from '../api/config';
import { toastStore } from '../store/store';

const Signup = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toastStore.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await apiRequest(AUTH_API.REGISTER, { method: 'POST', body: JSON.stringify(form) });
      toastStore.success('Account created! Please login.');
      navigate('/login');
    } catch (err) { toastStore.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create Account</h1>
          <p className="text-gray-500 mt-2">Join us and start shopping</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="First Name" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
              className="px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
            <input placeholder="Last Name" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
              className="px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          </div>
          <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          <input type="password" placeholder="Password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          <input type="password" placeholder="Confirm Password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
export default Signup;