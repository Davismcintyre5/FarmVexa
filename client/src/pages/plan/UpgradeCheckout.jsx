import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import { ArrowLeft, AlertTriangle, CheckCircle, ArrowUpCircle, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function UpgradeCheckout() {
    const navigate = useNavigate();
    const { planName } = useParams();

    const [plansData, setPlansData] = useState(null);
    const [targetPlan, setTargetPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [invoice, setInvoice] = useState(null);
    const [mpesaOpen, setMpesaOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`${API_BASE}/farm/plans`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                const data = res.data.data || res.data;
                setPlansData(data);
                const plan = data.plans?.find(
                    (p) => p.name.toLowerCase().replace(/\s+/g, '_') === planName
                );
                setTargetPlan(plan);
            })
            .catch(() => toast.error('Failed to load plans'))
            .finally(() => setLoading(false));
    }, [planName, navigate]);

    const submit = async () => {
        if (!targetPlan) return;
        setSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(
                `${API_BASE}/farm/plans/upgrade`,
                { newPlan: targetPlan.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const inv = res.data?.data?.invoice;
            setInvoice(inv);
            setSubmitted(true);
            toast.success('Upgrade invoice created');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upgrade failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSuccess = () => {
        setMpesaOpen(false);
        setTimeout(() => navigate('/plans', { replace: true }), 1200);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!targetPlan || targetPlan.status !== 'upgrade_available') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
                <div className="max-w-lg mx-auto px-4 text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upgrade Not Available</h1>
                    <p className="text-gray-500 mb-4">This plan is not available for upgrade.</p>
                    <Link to="/plans" className="text-primary-500 hover:underline">Back to Plans</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
                <div className="max-w-lg mx-auto px-4">
                    <Link to="/plans" className="flex items-center gap-2 text-gray-500 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Plans
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">⬆️ Upgrade Checkout</h1>

                    <Card className="mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Current Plan</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{plansData?.currentPlan}</p>
                                </div>
                                <ArrowUpCircle className="w-6 h-6 text-gray-400" />
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">New Plan</p>
                                    <p className="font-semibold text-green-700">{targetPlan.name}</p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Full Price</span>
                                    <span className="text-sm text-gray-400 line-through">KES {targetPlan.price}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-sm text-gray-500">You Pay</span>
                                    <span className="text-3xl font-bold text-green-700">KES {targetPlan.upgradeCost}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Difference from current plan price</p>
                            </div>
                        </div>
                    </Card>

                    {!submitted && (
                        <Card className="mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Submitting will create an invoice for KES {targetPlan.upgradeCost}. You'll be able to pay by M-Pesa STK or the manual methods available.
                            </p>
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-4">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                    <strong>Note:</strong> Upgrade requests without payment are auto-rejected within 3 hours.
                                </p>
                            </div>
                            <Button onClick={submit} loading={submitting} size="lg" className="w-full">
                                Create Upgrade Invoice
                            </Button>
                        </Card>
                    )}

                    {submitted && invoice && (
                        <Card className="mb-6">
                            <div className="text-sm space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Invoice</span>
                                    <span className="font-mono text-xs">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Amount Due</span>
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
                    )}

                    {submitted && (
                        <div className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                            <div className="text-sm">
                                <p className="font-medium text-green-700 dark:text-green-300">Upgrade submitted</p>
                                <p className="mt-0.5 text-xs text-green-700/80 dark:text-green-300/80">
                                    Admin will verify your payment and approve shortly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {submitted && invoice && (
                <PayWithMpesaModal
                    open={mpesaOpen}
                    onClose={() => setMpesaOpen(false)}
                    invoiceNumber={invoice.invoiceNumber}
                    amount={invoice.amountDue}
                    currency={invoice.currency}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
}