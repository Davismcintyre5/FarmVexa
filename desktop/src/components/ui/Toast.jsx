import { Toaster } from 'react-hot-toast';

export default function Toast() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: { borderRadius: '8px', padding: '12px 16px' },
            }}
        />
    );
}