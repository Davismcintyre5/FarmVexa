import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import { CheckCircle, Clock, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Pending() {
    const { user, invoice, scope, refresh, logout } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({});
    const [showPay, setShowPay] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const interval = setInterval(() => { refresh().catch(() => {}); }, 30000);
        return () => clearInterval(interval);
    }, [refresh]);

    useEffect(() => {
        if (scope === 'active') navigate('/dashboard', { replace: true });
    }, [scope, navigate]);

    const handleCheck = async () => {
        setChecking(true);
        try { await refresh(); } finally { setChecking(false); }
    };

    const isPaid = invoice?.status === 'paid';
    const amountDue = invoice?.amountDue || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-lg w-full space-y-4">
                <Card>
                    <div className="flex items-start gap-3">
                        <Clock className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Account Pending</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {isPaid
                                    ? 'Payment received. Waiting for admin approval.'
                                    : 'Complete payment to activate your account.'}
                            </p>
                        </div>
                    </div>
                </Card>

                {!isPaid && invoice && amountDue > 0 && (
                    <>
                        <Card title="Invoice Summary">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Invoice</span>
                                    <span className="font-medium">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Amount Due</span>
                                    <span className="font-bold text-green-700">
                                        {invoice.currency || 'KES'} {amountDue.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <Button onClick={() => setShowPay(true)} className="w-full mt-4">
                                Pay with M-Pesa
                            </Button>
                        </Card>

                        {invoice.paymentInstructions?.length > 0 && (
                            <Card title="Other Payment Methods">
                                <PaymentInstructions instructions={invoice.paymentInstructions} hideStk={true} />
                            </Card>
                        )}
                    </>
                )}

                {isPaid && invoice && (
                    <Card title="Payment Receipt">
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-700">Payment Confirmed</p>
                                <p className="text-sm text-green-600">Waiting for admin approval</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Invoice</span>
                                <span className="font-medium">{invoice.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-medium">{invoice.currency} {invoice.amountPaid?.toLocaleString()}</span>
                            </div>
                            {invoice.paymentMethod && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Method</span>
                                    <span className="font-medium capitalize">{invoice.paymentMethod}</span>
                                </div>
                            )}
                            {invoice.paymentRef && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Reference</span>
                                    <span className="font-medium">{invoice.paymentRef}</span>
                                </div>
                            )}
                            {invoice.paidAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Paid At</span>
                                    <span className="font-medium">{new Date(invoice.paidAt).toLocaleString('en-KE')}</span>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {isPaid && (
                    <Card title="What Happens Next">
                        <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
                            <li>Admin verifies your payment</li>
                            <li>Your account is approved</li>
                            <li>You get access to the dashboard</li>
                        </ol>
                    </Card>
                )}

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCheck} loading={checking} className="flex-1">
                        <RefreshCw className="w-4 h-4" /> Check Status
                    </Button>
                    <Button variant="ghost" onClick={() => { logout(); navigate('/login'); }} className="flex-1">
                        Logout
                    </Button>
                </div>

                {settings.supportEmail && (
                    <p className="text-center text-xs text-gray-400">
                        Need help? {settings.supportEmail}
                        {settings.supportPhone && ` · ${settings.supportPhone}`}
                    </p>
                )}
            </div>

            <PayWithMpesaModal
                open={showPay}
                onClose={() => setShowPay(false)}
                invoiceNumber={invoice?.invoiceNumber}
                defaultPhone={user?.phone || ''}
                onSuccess={() => { setShowPay(false); refresh().catch(() => {}); }}
            />
        </div>
    );
}