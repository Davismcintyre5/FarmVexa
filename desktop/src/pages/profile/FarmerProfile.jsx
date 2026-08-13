import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', county: user?.county || '', subCounty: user?.subCounty || '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try { await updateProfile(form); updateUser(form); toast.success('Profile updated'); }
        catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Card>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">{user?.name?.charAt(0)}</div>
                    <div><h2 className="text-lg font-bold">{user?.name}</h2><p className="text-gray-500">{user?.email}</p></div>
                </div>
                <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Mail className="w-4 h-4" /> {user?.email}</div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Phone className="w-4 h-4" /> {user?.phone || 'Not set'}</div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4" /> {user?.county ? `${user.county}, ${user.subCounty}` : 'Not set'}</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
                    <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
                        <Input label="Sub-County" value={form.subCounty} onChange={(e) => setForm({ ...form, subCounty: e.target.value })} />
                    </div>
                    <Button type="submit" loading={saving} className="w-full">Save</Button>
                </form>
                <div className="mt-4 pt-4 border-t">
                    <Link to="/change-password"><Button variant="outline" className="w-full">Change Password</Button></Link>
                </div>
            </Card>
        </div>
    );
}