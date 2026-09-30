import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import Spinner from '../../components/ui/Spinner';
import { getInvoice } from '../../api/invoices';
import { CheckCircle, FileText } from 'lucide-react';

export default function Invoice() {
    const { invoiceNumber } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPay, setShowPay] = useState(false);

    const load = () => {
        setLoading(true);
        getInvoice(invoiceNumber)
            .then((res) => setInvoice(res.data.data?.invoice || res.data.invoice))
            .catch(() => setInvoice(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [invoiceNumber]);

    if (loading) return <Spinner size="lg" className="mt-20" />;
    if (!invoice) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3" />
                <p>Invoice not found</p>
            </div>
        </div>
    );

    const isPaid = invoice.status === 'paid';
    const hasStk = invoice.paymentInstructions?.some((i) => i.code === 'mpesa_stk');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-lg mx-auto px-4 space-y-4">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice</h1>
                    <p className="text-gray-500">{invoice.invoiceNumber}</p>
                </div>

                <Card>
                    {invoice.lineItems?.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {invoice.lineItems.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{item.description || item.name}</span>
                                    <span className="font-medium">{invoice.currency} {item.amount?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
                        {invoice.subtotal != null && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>{invoice.currency} {invoice.subtotal.toLocaleString()}</span>
                            </div>
                        )}
                        {invoice.discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Discount</span>
                                <span className="text-green-600">- {invoice.currency} {invoice.discount.toLocaleString()}</span>
                            </div>
                        )}
                        {invoice.tax > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax</span>
                                <span>{invoice.currency} {invoice.tax.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span className="text-green-700">{invoice.currency} {invoice.total?.toLocaleString()}</span>
                        </div>
                    </div>
                </Card>

                {isPaid ? (
                    <Card>
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-700">Already Paid</p>
                                <p className="text-sm text-green-600">This invoice has been settled.</p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <>
                        {hasStk && (
                            <Card>
                                <Button onClick={() => setShowPay(true)} className="w-full" size="lg">
                                    Pay with M-Pesa
                                </Button>
                            </Card>
                        )}
                        {invoice.paymentInstructions?.length > 0 && (
                            <Card title="Other Payment Methods">
                                <PaymentInstructions instructions={invoice.paymentInstructions} hideStk={hasStk} />
                            </Card>
                        )}
                    </>
                )}
            </div>

            <PayWithMpesaModal
                open={showPay}
                onClose={() => setShowPay(false)}
                invoiceNumber={invoice.invoiceNumber}
                onSuccess={() => { setShowPay(false); load(); }}
            />
        </div>
    );
}