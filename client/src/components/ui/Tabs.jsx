export default function Tabs({ tabs, activeTab, onChange }) {
    return (
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                        activeTab === tab.key
                            ? 'border-primary-500 text-primary-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}