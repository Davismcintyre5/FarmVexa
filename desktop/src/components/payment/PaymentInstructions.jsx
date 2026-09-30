export default function PaymentInstructions({ instructions = [], hideStk = false }) {
    const list = hideStk ? instructions.filter((i) => i.code !== 'mpesa_stk') : instructions;

    if (list.length === 0) return null;

    const recipientFields = (recipient) => {
        const fields = [];
        if (recipient?.phone) fields.push(['Phone', recipient.phone]);
        if (recipient?.tillNumber) fields.push(['Till Number', recipient.tillNumber]);
        if (recipient?.paybillNumber) fields.push(['Paybill', recipient.paybillNumber]);
        if (recipient?.accountNumber) fields.push(['Account Number', recipient.accountNumber]);
        if (recipient?.bankName) fields.push(['Bank', recipient.bankName]);
        if (recipient?.accountName) fields.push(['Account Name', recipient.accountName]);
        if (recipient?.branch) fields.push(['Branch', recipient.branch]);
        if (recipient?.swift) fields.push(['SWIFT', recipient.swift]);
        return fields;
    };

    return (
        <div className="space-y-4">
            {list.map((instruction, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{instruction.title}</h3>
                    {instruction.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{instruction.description}</p>
                    )}
                    {instruction.recipient && (
                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                            {recipientFields(instruction.recipient).map(([label, value], i) => (
                                <div key={i}>
                                    <span className="text-gray-400">{label}: </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {instruction.steps?.length > 0 && (
                        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                            {instruction.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                    )}
                </div>
            ))}
        </div>
    );
}