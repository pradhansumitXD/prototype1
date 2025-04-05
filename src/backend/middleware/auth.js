const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid authentication' });
    }
};

module.exports = auth;