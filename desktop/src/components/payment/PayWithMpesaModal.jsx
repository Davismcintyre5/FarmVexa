import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { payWithStk, pollStkStatus } from '../../api/invoices';
import toast from 'react-hot-toast';

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 5 * 60 * 1000;

export default function PayWithMpesaModal({ open, onClose, invoiceNumber, amount, currency = 'KES', onSuccess }) {
    const [phone, setPhone] = useState('');
    const [state, setState] = useState('idle'); // idle | sending | waiting | success | failed | timeout
    const [message, setMessage] = useState('');
    const pollTimerRef = useRef(null);
    const timeoutRef = useRef(null);
    const startedAtRef = useRef(null);
    const checkoutIdRef = useRef(null);
    const userClosedRef = useRef(false);

    const stopPolling = useCallback(() => {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        pollTimerRef.current = null;
        timeoutRef.current = null;
    }, []);

    useEffect(() => {
        if (!open) {
            stopPolling();
            setState('idle');
            setPhone('');
            setMessage('');
            checkoutIdRef.current = null;
            startedAtRef.current = null;
            userClosedRef.current = false;
        }
    }, [open, stopPolling]);

    useEffect(() => () => stopPolling(), [stopPolling]);

    const finishSuccess = useCallback(() => {
        stopPolling();
        setState('success');
        setMessage('Payment received');
        toast.success('Payment received');
        if (onSuccess) {
            setTimeout(() => onSuccess(), 1200);
        }
    }, [stopPolling, onSuccess]);

    const finishFailure = useCallback((msg) => {
        stopPolling();
        setState('failed');
        setMessage(msg || 'Payment failed');
    }, [stopPolling]);

    const startPolling = useCallback((checkoutRequestId) => {
        startedAtRef.current = Date.now();

        const tick = async () => {
            if (userClosedRef.current) return;

            if (Date.now() - startedAtRef.current > TIMEOUT_MS) {
                setState('timeout');
                setMessage('No confirmation received. Tap "Send again" to retry.');
                stopPolling();
                return;
            }

            try {
                const res = await pollStkStatus(checkoutRequestId);
                const status = res.data?.data?.status;

                if (status === 'success') {
                    finishSuccess();
                    return;
                }
                if (status === 'failed' || status === 'cancelled') {
                    finishFailure(res.data?.data?.message || 'Payment was cancelled or failed');
                    return;
                }
            } catch {
                // transient error — keep polling
            }

            pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        };

        tick();
    }, [finishSuccess, finishFailure, stopPolling]);

    const submit = async () => {
        const cleaned = phone.trim();
        if (!cleaned) {
            toast.error('Enter your M-Pesa phone number');
            return;
        }

        setState('sending');
        setMessage('');

        try {
            const res = await payWithStk(invoiceNumber, cleaned);
            const checkoutRequestId = res.data?.data?.checkoutRequestId;
            if (!checkoutRequestId) {
                finishFailure('STK push failed. Please try again.');
                return;
            }

            checkoutIdRef.current = checkoutRequestId;
            setState('waiting');
            setMessage(res.data?.data?.message || 'Check your phone and enter your PIN.');

            startPolling(checkoutRequestId);
        } catch (err) {
            finishFailure(err.response?.data?.message || 'STK push failed. Please try again.');
        }
    };

    const handleClose = () => {
        userClosedRef.current = true;
        stopPolling();
        onClose();
    };

    const retry = () => {
        userClosedRef.current = false;
        checkoutIdRef.current = null;
        startedAtRef.current = null;
        setState('idle');
        setMessage('');
    };

    const canSubmit = state === 'idle' || state === 'failed' || state === 'timeout';
    const isBusy = state === 'sending' || state === 'waiting';

    return (
        <Modal open={open} onClose={handleClose} title="Pay with M-Pesa" size="sm">
            <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Invoice</span>
                        <span className="font-mono text-xs text-gray-900 dark:text-gray-100">{invoiceNumber}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Amount</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {currency} {Number(amount || 0).toLocaleString('en-KE')}
                        </span>
                    </div>
                </div>

                {state === 'idle' && (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter the phone number registered with M-Pesa. You'll receive a prompt on your phone to authorize payment.
                        </p>
                        <Input
                            label="M-Pesa Phone Number"
                            type="tel"
                            placeholder="+254 7XX XXX XXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isBusy}
                        />
                    </>
                )}

                {state === 'sending' && (
                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending STK push...
                    </div>
                )}

                {state === 'waiting' && (
                    <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                        <Loader2 className="w-4 h-4 animate-spin mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Check your phone</p>
                            <p className="text-xs mt-0.5">{message}</p>
                            <p className="text-xs mt-1 opacity-70">Waiting for confirmation…</p>
                        </div>
                    </div>
                )}

                {state === 'success' && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Payment received. Thank you!</span>
                    </div>
                )}

                {state === 'failed' && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {state === 'timeout' && (
                    <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    {state === 'success' ? (
                        <Button onClick={handleClose} className="w-full">Close</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={state === 'sending'}>
                                Cancel
                            </Button>
                            {(state === 'failed' || state === 'timeout') ? (
                                <Button onClick={retry}>Send again</Button>
                            ) : (
                                <Button onClick={submit} loading={state === 'sending'} disabled={isBusy || !phone.trim()}>
                                    <Phone className="w-4 h-4" /> Send STK
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}