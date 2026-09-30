import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import { getInvoiceByNumber } from '../../api/invoices';

const formatMoney = (amount, currency = 'KES') =>
    `${currency} ${Number(amount || 0).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function Invoice() {
    const { invoiceNumber } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mpesaOpen, setMpesaOpen] = useState(false);

    useEffect(() => {
        if (!invoiceNumber) return;
        getInvoiceByNumber(invoiceNumber)
            .then((res) => setInvoice(res.data?.data?.invoice || null))
            .catch((err) => setError(err.response?.data?.message || 'Invoice not found'))
            .finally(() => setLoading(false));
    }, [invoiceNumber]);

    const handlePaymentSuccess = () => {
        setMpesaOpen(false);
        setTimeout(() => window.location.reload(), 1200);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Invoice not found</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Check the link or contact support.
                </p>
                <Link to="/" className="inline-block mt-6 text-primary-500 hover:underline">Back to home</Link>
            </div>
        );
    }

    const paid = invoice.status === 'paid';
    const hasStk = invoice.paymentInstructions?.some((p) => p.code === 'mpesa_stk');
    const currency = invoice.currency || 'KES';

    return (
        <>
            <div className="mx-auto max-w-2xl px-4 py-12">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary-500">🌾 FarmVexa</h1>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${paid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                        {paid ? 'Paid' : 'Payment due'}
                    </span>
                </div>

                <Card>
                    <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Invoice</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {invoice.invoiceNumber}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Issued</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(invoice.issuedAt)}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Due {formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>

                    <div className="py-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Billed to</p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {invoice.customerSnapshot?.name || '—'}
                        </p>
                        {invoice.customerSnapshot?.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {invoice.customerSnapshot.email}
                            </p>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    <th className="pb-2 text-left font-medium">Description</th>
                                    <th className="pb-2 text-right font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice.items || []).map((item, i) => (
                                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="py-3 text-gray-900 dark:text-gray-100">
                                            {item.name}
                                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                {item.qty} × {formatMoney(item.unitPrice, currency)}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                                            {formatMoney(item.subtotal, currency)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm">
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>{formatMoney(invoice.subtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                            <span>Total</span>
                            <span>{formatMoney(invoice.total, currency)}</span>
                        </div>
                        {!paid && (
                            <div className="flex justify-between text-sm font-semibold text-yellow-600">
                                <span>Amount due</span>
                                <span>{formatMoney(invoice.amountDue, currency)}</span>
                            </div>
                        )}
                    </div>

                    {!paid && hasStk && (
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <Button size="lg" onClick={() => setMpesaOpen(true)} className="w-full">
                                <Smartphone className="w-4 h-4" /> Pay with M-Pesa
                            </Button>
                        </div>
                    )}

                    {!paid && invoice.paymentInstructions?.length > 0 && (
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Other payment methods
                            </p>
                            <PaymentInstructions instructions={invoice.paymentInstructions} hideStk />
                        </div>
                    )}

                    {invoice.notes && (
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-400">
                            {invoice.notes}
                        </div>
                    )}
                </Card>

                <div className="mt-6 text-center">
                    <a href="mailto:support@farmvexa.com" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                        Questions? support@farmvexa.com
                    </a>
                </div>
            </div>

            <PayWithMpesaModal
                open={mpesaOpen}
                onClose={() => setMpesaOpen(false)}
                invoiceNumber={invoice.invoiceNumber}
                amount={invoice.amountDue}
                currency={currency}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
}