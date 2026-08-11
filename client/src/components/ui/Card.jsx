export default function Card({ title, subtitle, children, footer, className = '', hover = false }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}>
            {(title || subtitle) && (
                <div className="p-4 pb-0">
                    {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
                </div>
            )}
            <div className="p-4">{children}</div>
            {footer && <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
        </div>
    );
}