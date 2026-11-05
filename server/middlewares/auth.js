import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'destinataste_super_secret_jwt_key_2026';

// Middleware memverifikasi token pengguna / admin
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan masuk (login) terlebih dahulu.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Sesi login telah kedaluwarsa atau token tidak valid. Silakan masuk kembali.',
    });
  }
};

// Middleware verifikasi khusus Admin
export const requireAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Akses terlarang. Fitur ini hanya dapat diakses oleh Administrator.',
      });
    }
  });
};
