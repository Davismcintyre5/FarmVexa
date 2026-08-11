export default function Footer() {
    return (
        <footer className="h-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center px-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">© {new Date().getFullYear()} FarmVexa. See. Sense. Predict. Grow.</p>
        </footer>
    );
}