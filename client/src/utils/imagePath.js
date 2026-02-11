export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    
    if (import.meta.env.PROD) {
        // Remove 'http://localhost:5000' if it mistakenly got saved in DB (unlikely but safe)
        const cleanPath = path.replace('http://localhost:5000', '');
        return `https://fundamental-konstanze-timberzee-0438c2f6.koyeb.app${cleanPath}`;
    }
    
    return path;
};
