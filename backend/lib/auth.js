const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey_donasiku');
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Akses ditolak, token tidak valid!' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Akses ditolak, tidak ada token authorization!' });
  }
};

module.exports = { protect };