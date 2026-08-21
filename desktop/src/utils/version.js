export const getVersion = async () => {
    if (window.electronAPI?.getAppVersion) {
        return await window.electronAPI.getAppVersion();
    }
    return import.meta.env.VITE_APP_VERSION || '1.0.0';
};