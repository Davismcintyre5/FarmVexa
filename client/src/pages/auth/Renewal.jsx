import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, Phone, Wallet, Landmark, CreditCard, AlertTriangle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Renewal() {
    const navigate = useNavigate();

    const [subscription, setSubscription] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');
    const [finalConfirm, setFinalConfirm] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`${API_BASE}/farm/renewal/subscription`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setSubscription(res.data.data || res.data))
            .catch((err) => {
                console.error('Subscription fetch error:', err.response?.data || err.message);
                toast.error(err.response?.data?.message || 'Failed to load subscription');
            })
            .finally(() => setLoading(false));

        axios.get(`${API_BASE}/admin/public/settings`)
            .then((res) => setPaymentMethods(res.data.data?.paymentMethods || []))
            .catch(() => {});
    }, [navigate]);

    const methodIcons = {
        mpesa_stk: Wallet,
        mpesa_send_money: Phone,
        mpesa_till: Wallet,
        mpesa_paybill: Wallet,
        bank: Landmark,
        card: CreditCard,
    };

    const methodLabels = {
        mpesa_stk: 'M-Pesa STK Push',
        mpesa_send_money: 'M-Pesa Send Money',
        mpesa_till: 'M-Pesa Till Number',
        mpesa_paybill: 'M-Pesa Paybill',
        bank: 'Bank Transfer',
        card: 'Card Payment',
    };

    const renderInstructions = (method) => {
        const amount = subscription?.planPrice || 500;
        const phone = method.details?.phoneNumber;

        switch (method.type) {
            case 'mpesa_send_money':
                return (
                    <ol className="text-sm text-gray-600 space-y-2">
                        <li>1. Go to M-PESA on your Safaricom line</li>
                        <li>2. Select <strong>Send Money</strong></li>
                        <li>3. Enter number: <strong>{phone}</strong></li>
                        <li>4. Enter amount: <strong>KES {amount}</strong></li>
                        <li>5. Enter your M-PESA PIN</li>
                        <li>6. Come back and confirm you have paid</li>
                    </ol>
                );
            case 'mpesa_till':
                return (
                    <ol className="text-sm text-gray-600 space-y-2">
                        <li>1. Go to M-PESA</li>
                        <li>2. Select <strong>Lipa na M-PESA</strong></li>
                        <li>3. Select <strong>Buy Goods and Services</strong></li>
                        <li>4. Enter Till Number: <strong>{method.details?.tillNumber}</strong></li>
                        <li>5. Enter amount: <strong>KES {amount}</strong></li>
                        <li>6. Enter your M-PESA PIN</li>
                        <li>7. Come back and confirm</li>
                    </ol>
                );
            case 'mpesa_paybill':
                return (
                    <ol className="text-sm text-gray-600 space-y-2">
                        <li>1. Go to M-PESA</li>
                        <li>2. Select <strong>Lipa na M-PESA</strong></li>
                        <li>3. Select <strong>Pay Bill</strong></li>
                        <li>4. Enter Business Number: <strong>{method.details?.paybill}</strong></li>
                        <li>5. Enter Account Number: <strong>{method.details?.accountNumber}</strong></li>
                        <li>6. Enter amount: <strong>KES {amount}</strong></li>
                        <li>7. Enter your M-PESA PIN</li>
                        <li>8. Come back and confirm</li>
                    </ol>
                );
            case 'bank':
                return (
                    <ol className="text-sm text-gray-600 space-y-2">
                        <li>1. Go to your bank app or branch</li>
                        <li>2. Transfer to: <strong>{method.details?.bankName}</strong></li>
                        <li>3. Account: <strong>{method.details?.accountNumber}</strong></li>
                        <li>4. Amount: <strong>KES {amount}</strong></li>
                        <li>5. Note the reference</li>
                        <li>6. Come back and confirm</li>
                    </ol>
                );
            default:
                return <p className="text-sm text-gray-500">Follow the payment instructions.</p>;
        }
    };

    const handleSubmit = async () => {
        if (!selectedMethod) return toast.error('Select a payment method');
        if (!finalConfirm) return toast.error('Please confirm you have paid');
        if (!paymentReference) return toast.error('Enter payment reference');

        setSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            await axios.post(`${API_BASE}/farm/renewal/submit`, {
                paymentMethod: selectedMethod.type,
                paymentReference,
                amount: subscription?.planPrice || 500,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Renewal submitted! Awaiting approval.');
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Renewal failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // STATE 1: Pending Renewal
    if (subscription?.pendingRenewal) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
                <div className="max-w-lg mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🔄 Renewal In Progress</h1>
                    <Card>
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-10 h-10 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Renewal Under Review</h2>
                            <p className="text-gray-500 mb-4">Admin is verifying your payment.</p>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>Submitted: <strong>{new Date(subscription.pendingRenewal.submittedAt).toLocaleString('en-KE')}</strong></p>
                                <p>Reference: <strong>{subscription.pendingRenewal.reference}</strong></p>
                                <p>Amount: <strong>KES {subscription.pendingRenewal.amount}</strong></p>
                                <p>Method: <strong>{methodLabels[subscription.pendingRenewal.paymentMethod] || 'N/A'}</strong></p>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">You'll receive an email when approved.</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // STATE 2: Active (not expired)
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
                            <p className="text-gray-500 mb-4">Your subscription is active.</p>
                            <div className="text-sm text-gray-600 space-y-2">
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

    // STATE 3: Lifetime (one-time plan)
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

    // STATE 4: Expired — show renewal form
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-lg mx-auto px-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 mb-6">
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
                            <span className="font-semibold">{subscription?.plan || 'Monthly'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Amount</span>
                            <span className="font-semibold text-green-700">KES {subscription?.planPrice || 500}/month</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Expired</span>
                            <span className="text-sm text-red-500">
                                {subscription?.subscriptionExpiry ? new Date(subscription.subscriptionExpiry).toLocaleDateString('en-KE') : 'Today'}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="mb-6">
                    <p className="font-semibold text-gray-900 dark:text-white mb-4">Select Payment Method</p>
                    {paymentMethods.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No payment methods available.</p>
                    ) : (
                        <div className="space-y-2">
                            {paymentMethods.map((method) => {
                                const Icon = methodIcons[method.type] || Wallet;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method)}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                            selectedMethod?.id === method.id
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 hover:border-primary-300'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${selectedMethod?.id === method.id ? 'text-primary-500' : 'text-gray-400'}`} />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {methodLabels[method.type] || method.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {selectedMethod && (
                    <Card className="mb-6">
                        <p className="font-semibold text-gray-900 dark:text-white mb-3">
                            {methodLabels[selectedMethod.type]} Instructions
                        </p>
                        <div className="space-y-4">
                            {renderInstructions(selectedMethod)}

                            <Input
                                label="Payment Reference / Transaction ID"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                placeholder="e.g., QWERTY123"
                            />

                            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700">
                                    <strong>Final warning:</strong> Renewal requests without payment are auto-rejected within 3 hours.
                                </p>
                            </div>

                            <label className="flex items-start gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={finalConfirm}
                                    onChange={(e) => setFinalConfirm(e.target.checked)}
                                    className="mt-1"
                                />
                                I confirm I have paid KES {subscription?.planPrice || 500} via {methodLabels[selectedMethod.type]}
                            </label>

                            <Button onClick={handleSubmit} loading={submitting} className="w-full" size="lg" disabled={!finalConfirm || !paymentReference}>
                                <RefreshCw className="w-4 h-4" /> Confirm Payment & Renew
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}