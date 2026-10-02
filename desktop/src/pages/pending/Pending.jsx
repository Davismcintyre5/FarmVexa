import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Clock, LogOut, Mail, Phone, FileText, Smartphone,
    CheckCircle2, Receipt, ArrowRight, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import PaymentInstructions from '../../components/payment/PaymentInstructions';

const POLL_MS = 30000;

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ${Number(amount || 0).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;

const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }) : '—';

export default function Pending() {
    const navigate = useNavigate();
    const { user, invoice, scope, isAuthenticated, isLoading, logout, refresh } = useAuth();

    const [publicSettings, setPublicSettings] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const [mpesaOpen, setMpesaOpen] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        api.get('/admin/public/settings')
            .then((res) => setPublicSettings(res.data?.data || {}))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (isLoading) {
            setReady(false);
            return;
        }
        const t = setTimeout(() => setReady(true), 200);
        return () => clearTimeout(t);
    }, [isLoading]);

    useEffect(() => {
        if (!ready) return;
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }
        if (scope === 'active') {
            navigate('/dashboard', { replace: true });
        }
    }, [ready, isAuthenticated, scope, navigate]);

    useEffect(() => {
        if (!isAuthenticated || scope !== 'pending') return;
        const id = setInterval(async () => {
            try {
                const data = await refresh();
                if (data?.scope === 'active') {
                    navigate('/dashboard', { replace: true });
                }
            } catch {}
        }, POLL_MS);
        return () => clearInterval(id);
    }, [isAuthenticated, scope, refresh, navigate]);

    const refreshNow = async () => {
        setRefreshing(true);
        try {
            const data = await refresh();
            if (data?.scope === 'active') {
                navigate('/dashboard', { replace: true });
                return;
            }
        } catch {}
        finally {
            setRefreshing(false);
        }
    };

    const handlePaymentSuccess = () => {
        setMpesaOpen(false);
        setTimeout(() => refreshNow(), 800);
    };

    if (isLoading || !ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Spinner size="lg" />
            </div>
        );
    }

    const hasInvoice = Boolean(invoice);
    const isPaid = invoice?.status === 'paid';
    const canPay = hasInvoice && !isPaid && (invoice?.amountDue || 0) > 0;
    const amountDue = invoice?.amountDue || 0;
    const currency = invoice?.currency || 'KES';
    const invoiceNumber = invoice?.invoiceNumber || '';
    const planName = user?.selectedPlan || 'Standard';

    const supportEmail = publicSettings.supportEmail || 'support@farmvexa.com';
    const supportPhone = publicSettings.supportPhone || '+254700000000';
    const whatsappNumber = publicSettings.whatsappNumber || '';
    const showWhatsapp = publicSettings.showWhatsapp ?? false;

    const allInstructions = Array.isArray(invoice?.paymentInstructions)
        ? invoice.paymentInstructions
        : [];

    const hasStk = allInstructions.some((i) => i.code === 'mpesa_stk');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
            <div className="mx-auto max-w-lg">
                <Card>
                    <div className="text-center">
                        <div
                            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                                isPaid
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                            }`}
                        >
                            {isPaid ? (
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            ) : (
                                <Clock className="w-8 h-8 text-yellow-600" />
                            )}
                        </div>

                        <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {isPaid ? 'Payment received' : 'Waiting for approval'}
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                            {isPaid ? (
                                <>
                                    Thanks <strong className="text-gray-900 dark:text-gray-100">{user?.name}</strong>.
                                    {' '}We've received your payment for the{' '}
                                    <strong className="text-gray-900 dark:text-gray-100">{planName}</strong> plan.
                                    Your account is now under review.
                                </>
                            ) : (
                                <>
                                    Thanks for registering{' '}
                                    <strong className="text-gray-900 dark:text-gray-100">{user?.name}</strong>.
                                    {canPay && (
                                        <>
                                            {' '}Pay the invoice below to activate your account on the{' '}
                                            <strong className="text-gray-900 dark:text-gray-100">{planName}</strong> plan.
                                        </>
                                    )}
                                    {!hasInvoice && (
                                        <> Your registration is with our team for review.</>
                                    )}
                                    {' '}We'll email you the moment you're approved.
                                </>
                            )}
                        </p>
                    </div>

                    {isPaid && hasInvoice && (
                        <div className="mt-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                    Payment confirmed
                                </p>
                            </div>

                            <div className="space-y-1.5 text-sm">
                                <Row label="Invoice" value={invoiceNumber} mono />
                                <Row label="Amount" value={formatMoney(invoice?.amountPaid || amountDue, currency)} bold />
                                <Row label="Method" value={invoice?.paymentMethod === 'mpesa_stk' ? 'M-Pesa STK Push' : invoice?.paymentMethod || '—'} />
                                <Row label="Reference" value={invoice?.paymentRef || invoice?.paymentReference || '—'} mono />
                                <Row label="Paid at" value={formatDateTime(invoice?.paidAt)} />
                            </div>
                        </div>
                    )}

                    {hasInvoice && !isPaid && (
                        <div className="mt-6 space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm">
                            <Row label="Name" value={user?.name || '—'} />
                            <Row label="Plan" value={planName} />
                            <Row label="Invoice" value={invoiceNumber || '—'} mono />
                            <Row label="Amount" value={formatMoney(amountDue, currency)} bold />
                            <Row
                                label="Status"
                                value="Unpaid"
                                valueClass="text-yellow-600 font-semibold"
                            />
                            <Row label="Email" value={user?.email || '—'} />
                        </div>
                    )}

                    {isPaid && (
                        <div className="mt-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-300 mb-3">
                                What happens next
                            </p>
                            <ol className="space-y-2.5 text-sm text-blue-800 dark:text-blue-300">
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold flex items-center justify-center">1</span>
                                    <span>Our team verifies your payment — usually within a few minutes.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold flex items-center justify-center">2</span>
                                    <span>Your account is approved and activated.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold flex items-center justify-center">3</span>
                                    <span>You receive a confirmation email — then you can log in and access your dashboard.</span>
                                </li>
                            </ol>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-2">
                        {canPay && hasStk && (
                            <Button size="lg" onClick={() => setMpesaOpen(true)} className="w-full">
                                <Smartphone className="w-4 h-4" /> Pay {formatMoney(amountDue, currency)} with M-Pesa
                            </Button>
                        )}

                        {hasInvoice && invoiceNumber && (
                            <Link to={`/invoice/${invoiceNumber}`} className="block w-full">
                                <Button variant="outline" size="lg" className="w-full">
                                    <FileText className="w-4 h-4" /> {isPaid ? 'View invoice' : 'View full invoice'}
                                </Button>
                            </Link>
                        )}

                        <Button variant="ghost" onClick={refreshNow} loading={refreshing} className="w-full">
                            Check status
                        </Button>

                        <Button variant="ghost" onClick={logout} className="w-full">
                            <LogOut className="w-4 h-4" /> Log out
                        </Button>
                    </div>

                    {canPay && allInstructions.length > 0 && (
                        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                                Other payment methods
                            </p>
                            <PaymentInstructions instructions={allInstructions} />
                        </div>
                    )}

                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">Need help?</p>
                        <div className="mt-2 flex flex-col items-center gap-1.5 text-xs">
                            <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-1.5 font-medium text-primary-500 hover:underline">
                                <Mail className="w-3 h-3" /> {supportEmail}
                            </a>
                            <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-primary-500 hover:underline">
                                <Phone className="w-3 h-3" /> {supportPhone}
                            </a>
                            {showWhatsapp && whatsappNumber && (
                                <a
                                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-medium text-green-600 hover:underline"
                                >
                                    💬 WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </Card>

                <p className="mt-4 text-center text-xs text-gray-400">
                    {isPaid ? 'Verification usually takes less than 24 hours.' : 'Usually takes less than 24 hours.'}
                </p>
            </div>

            {canPay && invoiceNumber && (
                <PayWithMpesaModal
                    open={mpesaOpen}
                    onClose={() => setMpesaOpen(false)}
                    invoiceNumber={invoiceNumber}
                    amount={amountDue}
                    currency={currency}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}

function Row({ label, value, bold, mono, valueClass }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <span className="shrink-0 text-gray-500 dark:text-gray-400">{label}</span>
            <span
                className={[
                    'text-right',
                    bold ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-900 dark:text-gray-100',
                    mono ? 'font-mono text-xs' : '',
                    valueClass || '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {value}
            </span>
        </div>
    );
}