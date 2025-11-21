import { useState, useEffect } from 'react';
import { ADDRESS_API, apiRequest } from '../api/config';
import { toastStore } from '../store/store';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', addressType: 'HOME' });

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try { setAddresses(await apiRequest(ADDRESS_API.GET_ALL)); } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(ADDRESS_API.ADD, { method: 'POST', body: JSON.stringify(form) });
      toastStore.success('Address added!');
      fetchAddresses();
      setShowForm(false);
      setForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', addressType: 'HOME' });
    } catch (err) { toastStore.error(err.message); }
  };

  const setDefault = async (id) => {
    try { await apiRequest(ADDRESS_API.SET_DEFAULT(id), { method: 'PUT' }); toastStore.success('Default address updated'); fetchAddresses(); }
    catch (err) { toastStore.error(err.message); }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try { await apiRequest(ADDRESS_API.DELETE(id), { method: 'DELETE' }); toastStore.success('Address deleted'); fetchAddresses(); }
    catch (err) { toastStore.error(err.message); }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">My Addresses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Add New</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Full Name" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
            <input placeholder="Phone" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          </div>
          <input placeholder="Address Line 1" required value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} className="w-full p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          <input placeholder="Address Line 2" value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})} className="w-full p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="City" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
            <input placeholder="State" required value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
            <input placeholder="Pincode" required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700" />
          </div>
          <select value={form.addressType} onChange={e => setForm({...form, addressType: e.target.value})} className="p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700">
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
            <option value="OTHER">Other</option>
          </select>
          <button type="submit" className="btn-primary w-full">Save Address</button>
        </form>
      )}

      <div className="space-y-4">
        {addresses.map(addr => (
          <div key={addr.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{addr.fullName}</span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{addr.addressType}</span>
                  {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>}
                </div>
                <p className="text-gray-600 dark:text-gray-400">{addr.addressLine1}, {addr.addressLine2}</p>
                <p className="text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-gray-500 text-sm mt-1">📞 {addr.phone}</p>
              </div>
              <div className="flex gap-2">
                {!addr.isDefault && <button onClick={() => setDefault(addr.id)} className="text-sm text-indigo-600 hover:underline">Set Default</button>}
                <button onClick={() => deleteAddress(addr.id)} className="text-sm text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Addresses;