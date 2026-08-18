import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, Phone, Wallet, Landmark, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Checkout() {
    const navigate = useNavigate();
    const [registrationData, setRegistrationData] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');
    const [stkPhone, setStkPhone] = useState('');
    const [stkStatus, setStkStatus] = useState(null);
    const [finalConfirm, setFinalConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const data = sessionStorage.getItem('registrationData');
        if (!data) {
            navigate('/register', { replace: true });
            return;
        }
        setRegistrationData(JSON.parse(data));

        axios.get(`${API_BASE}/admin/public/settings`)
            .then((res) => {
                const methods = res.data.data?.paymentMethods || [];
                setPaymentMethods(methods);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
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

    const isStk = selectedMethod?.type === 'mpesa_stk';

    const renderInstructions = (method) => {
        const amount = registrationData?.selectedPlan?.price;
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
                        <li>1. Go to M-PESA on your Safaricom line</li>
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
                        <li>1. Go to M-PESA on your Safaricom line</li>
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
                        <li>1. Go to your bank app or visit any branch</li>
                        <li>2. Transfer to Bank: <strong>{method.details?.bankName}</strong></li>
                        <li>3. Account Name: <strong>{method.details?.accountName}</strong></li>
                        <li>4. Account Number: <strong>{method.details?.accountNumber}</strong></li>
                        <li>5. Amount: <strong>KES {amount}</strong></li>
                        <li>6. Note the transaction reference</li>
                        <li>7. Come back and confirm</li>
                    </ol>
                );
            default:
                return <p className="text-sm text-gray-500">Follow the payment instructions provided.</p>;
        }
    };

    const handleStkPush = async () => {
        if (!stkPhone) return toast.error('Enter your M-Pesa phone number');
        setSubmitting(true);
        setStkStatus('pending');

        try {
            const res = await axios.post(`${API_BASE}/public/payment/stk-push`, {
                phone: stkPhone,
                amount: registrationData?.selectedPlan?.price,
                plan: registrationData?.selectedPlan?.name,
                registrationData,
            });

            if (res.data.success) {
                setStkStatus('success');
                toast.success('Payment request sent! Check your phone.');
            } else {
                setStkStatus('failed');
                toast.error(res.data.message || 'Payment failed');
            }
        } catch (err) {
            setStkStatus('failed');
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!finalConfirm) return toast.error('Please confirm you have paid');
        if (!paymentReference) return toast.error('Enter payment reference or transaction ID');

        setSubmitting(true);
        try {
            await axios.post(`${API_BASE}/public/payment/register`, {
                ...registrationData,
                password: registrationData.password,
                plan: registrationData.selectedPlan.name,
                paymentMethod: selectedMethod?.type,
                paymentReference,
                amount: registrationData.selectedPlan.price,
                interval: registrationData.selectedPlan.interval,
            });

            sessionStorage.removeItem('registrationData');
            
            // Show success overlay
            setShowSuccess(true);
            
            // Start countdown
            let seconds = 5;
            setCountdown(seconds);
            const interval = setInterval(() => {
                seconds -= 1;
                setCountdown(seconds);
                if (seconds <= 0) {
                    clearInterval(interval);
                    navigate('/login', { replace: true });
                }
            }, 1000);
            
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !registrationData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { selectedPlan, name, email, phone, county, subCounty } = registrationData;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-lg mx-auto px-4">
                <Link to="/register" className="flex items-center gap-2 text-gray-500 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

                {/* Plan Summary */}
                <Card className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Plan</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPlan?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-green-700">KES {selectedPlan?.price}</p>
                            <p className="text-xs text-gray-400">
                                {selectedPlan?.interval === 'monthly' ? 'per month' : 'one-time'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 space-y-1">
                        <p>👤 {name}</p>
                        <p>📧 {email}</p>
                        <p>📱 {phone}</p>
                        <p>📍 {county}, {subCounty}</p>
                    </div>
                </Card>

                {/* Payment Methods */}
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

                {/* Method Instructions */}
                {selectedMethod && (
                    <Card className="mb-6">
                        <p className="font-semibold text-gray-900 dark:text-white mb-3">
                            {methodLabels[selectedMethod.type]} Instructions
                        </p>

                        {isStk ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                    Enter your M-Pesa phone number. You'll receive a prompt to authorize payment.
                                </p>
                                <Input
                                    label="M-Pesa Phone Number"
                                    value={stkPhone}
                                    onChange={(e) => setStkPhone(e.target.value)}
                                    placeholder="+254 700 000 000"
                                />
                                <Button onClick={handleStkPush} loading={submitting} className="w-full" size="lg">
                                    {stkStatus === 'pending' ? 'Sending request...' : `Pay KES ${selectedPlan?.price}`}
                                </Button>
                                {stkStatus === 'success' && (
                                    <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 text-center">
                                        ✅ Check your phone and enter your M-PESA PIN to complete payment.
                                    </div>
                                )}
                                {stkStatus === 'failed' && (
                                    <p className="text-sm text-red-500 text-center">Payment failed. Try again.</p>
                                )}
                            </div>
                        ) : (
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
                                        <strong>Final warning:</strong> Registrations without verified payment are auto-rejected within 3 hours.
                                    </p>
                                </div>

                                <label className="flex items-start gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={finalConfirm}
                                        onChange={(e) => setFinalConfirm(e.target.checked)}
                                        className="mt-1"
                                    />
                                    I confirm I have paid KES {selectedPlan?.price} via {methodLabels[selectedMethod.type]}
                                </label>

                                <Button onClick={handleManualSubmit} loading={submitting} className="w-full" size="lg" disabled={!finalConfirm || !paymentReference}>
                                    Confirm Payment & Submit
                                </Button>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Registration Submitted!
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Your account is now under review. Admin will verify your payment and approve within 24 hours.
                        </p>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Redirecting to login in <strong>{countdown}</strong> seconds...
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-block py-3 px-6 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all"
                        >
                            Go to Login Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}