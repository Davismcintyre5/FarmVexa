import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import { ArrowLeft, AlertTriangle, RefreshCw, CheckCircle, Clock, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Renewal() {
    const navigate = useNavigate();

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [invoice, setInvoice] = useState(null);
    const [mpesaOpen, setMpesaOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`${API_BASE}/farm/renewal/subscription`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                const data = res.data.data || res.data;
                setSubscription(data);
                if (data?.invoice) setInvoice(data.invoice);
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || 'Failed to load subscription');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const submit = async () => {
        setSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(
                `${API_BASE}/farm/renewal/submit`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const inv = res.data?.data?.invoice;
            setInvoice(inv);
            toast.success('Renewal invoice created');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Renewal failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSuccess = () => {
        setMpesaOpen(false);
        setTimeout(() => window.location.reload(), 1200);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // STATE 1: Pending renewal invoice exists, no submit needed
    if (subscription?.subscriptionStatus === 'pending_renewal' && invoice) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
                    <div className="max-w-lg mx-auto px-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🔄 Renewal In Progress</h1>
                        <Card>
                            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl mb-4">
                                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Renewal Under Review</p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                        Pay the invoice below to complete your renewal.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Invoice</span>
                                    <span className="font-mono text-xs">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-bold text-green-700">KES {invoice.amountDue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Due</span>
                                    <span>{new Date(invoice.dueDate).toLocaleString('en-KE')}</span>
                                </div>
                            </div>

                            {invoice.paymentInstructions?.some((p) => p.code === 'mpesa_stk') && (
                                <Button size="lg" onClick={() => setMpesaOpen(true)} className="w-full mb-4">
                                    <Smartphone className="w-4 h-4" /> Pay with M-Pesa
                                </Button>
                            )}

                            {invoice.paymentInstructions?.length > 0 && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                                        Other ways to pay
                                    </p>
                                    <PaymentInstructions instructions={invoice.paymentInstructions} hideStk />
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
                <PayWithMpesaModal
                    open={mpesaOpen}
                    onClose={() => setMpesaOpen(false)}
                    invoiceNumber={invoice.invoiceNumber}
                    amount={invoice.amountDue}
                    currency={invoice.currency}
                    onSuccess={handlePaymentSuccess}
                />
            </>
        );
    }

    // STATE 2: Active and not expired
    if (subscription?.subscriptionStatus === 'active' && !subscription?.isExpired) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
                <div className="max-w-lg mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">✅ Subscription Active</h1>
                    <Card>
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're All Set!</h2>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                <p>Plan: <strong>{subscription.plan}</strong></p>
                                {subscription.subscriptionExpiry && (
                                    <p>Expires: <strong>{new Date(subscription.subscriptionExpiry).toLocaleDateString('en-KE')}</strong></p>
                                )}
                            </div>
                            <Link to="/dashboard" className="inline-block mt-4 py-2 px-6 bg-primary-500 text-white rounded-xl font-semibold">
                                Go to Dashboard
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // STATE 3: Lifetime (one_time)
    if (!subscription?.subscriptionExpiry && subscription?.planInterval === 'one_time') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
                <div className="max-w-lg mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">✅ Lifetime Plan</h1>
                    <Card>
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Renewal Needed</h2>
                            <p className="text-gray-500">Your {subscription.plan} plan is lifetime.</p>
                            <Link to="/dashboard" className="inline-block mt-4 py-2 px-6 bg-primary-500 text-white rounded-xl font-semibold">
                                Go to Dashboard
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // STATE 4: Expired — show "create renewal invoice" CTA
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-lg mx-auto px-4">
                <Link to="/login" className="flex items-center gap-2 text-gray-500 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🔄 Renew Subscription</h1>

                <Card className="mb-6">
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Your subscription has expired</p>
                            <p className="text-xs text-red-600 dark:text-red-400">Renew to regain access.</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Plan</span>
                            <span className="font-semibold">{subscription?.plan || 'Basic'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Amount</span>
                            <span className="font-semibold text-green-700">KES {subscription?.planPrice || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Expired</span>
                            <span className="text-sm text-red-500">
                                {subscription?.subscriptionExpiry ? new Date(subscription.subscriptionExpiry).toLocaleDateString('en-KE') : 'Today'}
                            </span>
                        </div>
                    </div>
                </Card>

                <Button onClick={submit} loading={submitting} size="lg" className="w-full">
                    <RefreshCw className="w-4 h-4" /> Create Renewal Invoice
                </Button>

                <p className="text-xs text-gray-400 text-center mt-3">
                    You'll be able to pay by M-Pesa STK or manual methods on the next step.
                </p>
            </div>
        </div>
    );
}