const auth = async (req, res, next) => {
    try {
        const userId = req.header('Authorization');
        const userRole = req.header('Role');
        
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        req.user = { 
            id: userId,
            role: userRole || 'user'
        };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid authentication' });
    }
};

module.exports = auth;