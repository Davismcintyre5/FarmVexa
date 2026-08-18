import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../api/auth';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SupportTab from './SupportTab';
import DownloadsTab from './DownloadsTab';
import DocumentsTab from './DocumentsTab';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [publicSettings, setPublicSettings] = useState({});
    const [profile, setProfile] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        county: user?.county || '',
        subCounty: user?.subCounty || '',
    });
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setPublicSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const handleProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await updateProfile(profile); updateUser(profile); toast.success('Profile updated'); }
        catch { toast.error('Failed'); }
        finally { setLoading(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            await changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
            setPasswords({ current: '', newPass: '', confirm: '' });
            toast.success('Password changed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'profile', label: 'Profile' },
        { key: 'password', label: 'Password' },
        { key: 'support', label: 'Support' },
        { key: 'documents', label: 'Documents' },
    ];

    const downloads = publicSettings.downloads?.filter((d) => d.enabled) || [];
    if (downloads.length > 0) tabs.push({ key: 'downloads', label: 'Downloads' });

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                            activeTab === key
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && (
                <Card>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{user?.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{user?.email}</div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{user?.phone || 'Not set'}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{user?.county ? `${user.county}, ${user.subCounty}` : 'Not set'}</div>
                    </div>
                    <form onSubmit={handleProfile} className="space-y-4 border-t pt-4">
                        <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                        <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="County" value={profile.county} onChange={(e) => setProfile({ ...profile, county: e.target.value })} />
                            <Input label="Sub-County" value={profile.subCounty} onChange={(e) => setProfile({ ...profile, subCounty: e.target.value })} />
                        </div>
                        <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
                    </form>
                </Card>
            )}

            {activeTab === 'password' && (
                <Card>
                    <form onSubmit={handlePassword} className="space-y-4">
                        <Input label="Current Password" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                        <Input label="New Password" type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} />
                        <Input label="Confirm Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                        <Button type="submit" loading={loading} className="w-full">Change Password</Button>
                    </form>
                </Card>
            )}

            {activeTab === 'support' && <SupportTab />}
            {activeTab === 'documents' && <DocumentsTab />}
            {activeTab === 'downloads' && <DownloadsTab />}
        </div>
    );
}