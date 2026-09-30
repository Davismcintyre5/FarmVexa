import { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { stkInvoice, getMpesaStatus } from '../../api/invoices';

export default function PayWithMpesaModal({ open, onClose, invoiceNumber, defaultPhone = '', onSuccess }) {
    const [phone, setPhone] = useState(defaultPhone);
    const [stage, setStage] = useState('input');
    const [error, setError] = useState('');
    const [checkoutId, setCheckoutId] = useState(null);
    const pollRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (open) {
            setPhone(defaultPhone || '');
            setStage('input');
            setError('');
            setCheckoutId(null);
        }
        return () => stopPolling();
    }, [open, defaultPhone]);

    const stopPolling = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    };

    const handleSend = async () => {
        if (!phone) { setError('Enter phone number'); return; }
        setError('');
        setStage('sending');
        try {
            const res = await stkInvoice({ invoiceNumber, phone });
            const id = res.data.data?.checkoutRequestId || res.data.checkoutRequestId;
            setCheckoutId(id);
            setStage('waiting');
            startPolling(id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send request');
            setStage('failed');
        }
    };

    const startPolling = (id) => {
        stopPolling();
        timeoutRef.current = setTimeout(() => {
            stopPolling();
            setStage('timeout');
        }, 5 * 60 * 1000);

        pollRef.current = setInterval(async () => {
            try {
                const res = await getMpesaStatus(id);
                const data = res.data.data || res.data;
                if (data.status === 'success' || data.invoiceStatus === 'paid') {
                    stopPolling();
                    setStage('success');
                    if (onSuccess) setTimeout(() => onSuccess(data), 1200);
                } else if (data.status === 'failed' || data.status === 'cancelled') {
                    stopPolling();
                    setStage('failed');
                    setError(data.message || 'Payment failed');
                }
            } catch {}
        }, 3000);
    };

    const handleClose = () => {
        stopPolling();
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} title="Pay with M-Pesa" size="sm">
            <div className="space-y-4">
                {stage === 'input' && (
                    <>
                        <p className="text-sm text-gray-500">Enter the M-Pesa phone number to receive the payment prompt.</p>
                        <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button onClick={handleSend} className="w-full">Send Payment Request</Button>
                    </>
                )}

                {stage === 'sending' && (
                    <div className="text-center py-6">
                        <Loader2 className="w-12 h-12 text-primary-500 mx-auto animate-spin mb-3" />
                        <p className="text-gray-500">Sending request...</p>
                    </div>
                )}

                {stage === 'waiting' && (
                    <div className="text-center py-6">
                        <Loader2 className="w-12 h-12 text-primary-500 mx-auto animate-spin mb-3" />
                        <p className="font-medium text-gray-900 dark:text-gray-100">Check your phone</p>
                        <p className="text-sm text-gray-500 mt-1">Enter your M-PESA PIN to complete payment.</p>
                        <p className="text-xs text-gray-400 mt-3">Waiting for confirmation...</p>
                    </div>
                )}

                {stage === 'success' && (
                    <div className="text-center py-6">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="font-medium text-green-700">Payment received!</p>
                    </div>
                )}

                {(stage === 'failed' || stage === 'timeout') && (
                    <div className="text-center py-6">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="font-medium text-red-700">
                            {stage === 'timeout' ? 'Payment timed out' : 'Payment failed'}
                        </p>
                        {error && <p className="text-sm text-gray-500 mt-1">{error}</p>}
                        <Button onClick={handleSend} variant="outline" className="mt-4">Send Again</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}