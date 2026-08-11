const logger = {
    info: (message) => {
        console.log(`[${new Date().toISOString()}] [INFO] ${message}`);
    },
    warn: (message) => {
        console.warn(`[${new Date().toISOString()}] [WARN] ${message}`);
    },
    error: (message) => {
        console.error(`[${new Date().toISOString()}] [ERROR] ${message}`);
    },
    debug: (message) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${new Date().toISOString()}] [DEBUG] ${message}`);
        }
    },
};

module.exports = logger;