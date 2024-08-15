function sanitizeObjectKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const sanitizedKey = key.replace(/[^a-zA-Z0-9_.-]/g, '');
            acc[sanitizedKey] = sanitizeObjectKeys(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

module.exports = sanitizeObjectKeys;