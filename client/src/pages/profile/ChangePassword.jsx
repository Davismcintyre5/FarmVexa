import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
        setLoading(true);
        try { await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }); toast.success('Password changed'); navigate('/profile'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to="/profile" className="flex items-center gap-2 text-gray-500"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <Card title="Change Password">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Current Password" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
                    <Input label="New Password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
                    <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                    <Button type="submit" loading={loading} className="w-full">Change Password</Button>
                </form>
            </Card>
        </div>
    );
}