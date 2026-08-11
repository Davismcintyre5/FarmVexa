export default function Table({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        {columns.map((col) => (
                            <th key={col.key} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={row._id || i}
                            onClick={() => onRowClick?.(row)}
                            className={`border-b border-gray-100 dark:border-gray-800 ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}