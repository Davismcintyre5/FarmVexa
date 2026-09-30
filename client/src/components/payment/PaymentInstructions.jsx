import { Wallet, Phone, Send, Landmark, CreditCard, Building2 } from 'lucide-react';

const ICONS = {
    mpesa_stk: Phone,
    mpesa_send: Send,
    mpesa_send_money: Send,
    mpesa_till: Wallet,
    mpesa_paybill: Building2,
    bank: Landmark,
    stripe: CreditCard,
    cash: Wallet,
};

export default function PaymentInstructions({ instructions, hideStk = false, className = '' }) {
    const list = Array.isArray(instructions) ? instructions : [];
    const visible = hideStk ? list.filter((i) => i.code !== 'mpesa_stk') : list;

    if (visible.length === 0) return null;

    return (
        <div className={`space-y-3 ${className}`}>
            {visible.map((method, idx) => {
                const Icon = ICONS[method.code] || Wallet;
                const recipient = method.recipient || {};
                const recipientEntries = Object.entries(recipient).filter(
                    ([, v]) => v !== null && v !== undefined && v !== ''
                );

                return (
                    <div
                        key={`${method.code || method.title}-${idx}`}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {method.title}
                                </p>
                                {method.description && (
                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        {method.description}
                                    </p>
                                )}

                                {recipientEntries.length > 0 && (
                                    <div className="mt-2 space-y-0.5">
                                        {recipientEntries.map(([k, v]) => (
                                            <p key={k} className="text-xs text-gray-900 dark:text-gray-100">
                                                <span className="capitalize text-gray-500 dark:text-gray-400">{k}:</span>{' '}
                                                <span className="font-mono font-medium">{String(v)}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {method.steps?.length > 0 && (
                                    <ol className="mt-2 list-decimal space-y-0.5 pl-4 text-xs text-gray-500 dark:text-gray-400">
                                        {method.steps.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}