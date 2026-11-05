import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'destinataste_super_secret_jwt_key_2026';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi!',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi minimal 6 karakter!',
      });
    }

    // Periksa apakah email sudah digunakan
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk.',
      });
    }

    // Hash kata sandi
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Daftarkan sebagai role 'pengguna'
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'pengguna', defaultAvatar]
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      role: 'pengguna',
      avatar: defaultAvatar,
    };

    // Buat JWT Token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Selamat datang di DestinaTaste.',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ success: false, message: 'Gagal melakukan pendaftaran akun', error: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Harap masukkan email dan kata sandi!',
      });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi tidak cocok!',
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi tidak cocok!',
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // 'pengguna' atau 'admin'
      avatar: user.avatar,
    };

    const token = jwt.sign(
      { id: userData.id, name: userData.name, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `Selamat datang kembali, ${userData.name}!`,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ success: false, message: 'Gagal melakukan login', error: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error('Error getMe:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat profil pengguna', error: error.message });
  }
};

// GET /api/auth/users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY id ASC');
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data pengguna', error: error.message });
  }
};

// PUT /api/auth/profile (User Edit Profile)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar, currentPassword, newPassword } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi!' });
    }

    // Ambil data user saat ini
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    const currentUser = existing[0];

    // Cek apakah email sudah dipakai user lain
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh akun lain!' });
      }
    }

    let updatedPassword = currentUser.password;
    if (newPassword && newPassword.trim() !== '') {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Harap masukkan kata sandi lama untuk mengubah kata sandi!' });
      }
      const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Kata sandi lama salah!' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter!' });
      }
      updatedPassword = await bcrypt.hash(newPassword, 10);
    }

    const newAvatar = avatar && avatar.trim() !== ''
      ? avatar
      : currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    await pool.query(
      'UPDATE users SET name = ?, email = ?, password = ?, avatar = ? WHERE id = ?',
      [name, email, updatedPassword, newAvatar, userId]
    );

    const updatedUser = {
      id: userId,
      name,
      email,
      role: currentUser.role,
      avatar: newAvatar,
    };

    // Buat JWT Token baru yang merefleksikan perubahan
    const token = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error('Error updateProfile:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil: ' + error.message });
  }
};

// POST /api/auth/users (Admin Create User)
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'pengguna', avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan kata sandi wajib diisi!' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Kata sandi minimal 6 karakter!' });
    }

    const validRole = role === 'admin' ? 'admin' : 'pengguna';

    // Cek email duplikat
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userAvatar = avatar && avatar.trim() !== ''
      ? avatar
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, validRole, userAvatar]
    );

    res.status(201).json({
      success: true,
      message: `Pengguna baru berhasil dibuat dengan peran ${validRole}!`,
      user: {
        id: result.insertId,
        name,
        email,
        role: validRole,
        avatar: userAvatar,
      },
    });
  } catch (error) {
    console.error('Error createUserByAdmin:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pengguna: ' + error.message });
  }
};

// PUT /api/auth/users/:id (Admin Update User)
export const updateUserByAdmin = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { name, email, role, password, avatar } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    const currentUser = existing[0];

    // Cek email jika diubah
    if (email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, targetId]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh akun lain!' });
      }
    }

    const newName = name || currentUser.name;
    const newEmail = email || currentUser.email;
    const newRole = role === 'admin' ? 'admin' : role === 'pengguna' ? 'pengguna' : currentUser.role;
    const newAvatar = avatar !== undefined ? avatar : currentUser.avatar;

    let newPassword = currentUser.password;
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Kata sandi minimal 6 karakter!' });
      }
      newPassword = await bcrypt.hash(password, 10);
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, password = ?, avatar = ? WHERE id = ?',
      [newName, newEmail, newRole, newPassword, newAvatar, targetId]
    );

    res.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui!',
      user: {
        id: targetId,
        name: newName,
        email: newEmail,
        role: newRole,
        avatar: newAvatar,
      },
    });
  } catch (error) {
    console.error('Error updateUserByAdmin:', error);
    res.status(500).json({ success: false, message: 'Gagal mengedit pengguna: ' + error.message });
  }
};

// DELETE /api/auth/users/:id (Admin Delete User)
export const deleteUserByAdmin = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);

    // Mencegah admin menghapus akunnya sendiri yang sedang aktif
    if (targetId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login!',
      });
    }

    const [existing] = await pool.query('SELECT id, name, role FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [targetId]);

    res.json({
      success: true,
      message: `Pengguna "${existing[0].name}" (${existing[0].role}) berhasil dihapus!`,
    });
  } catch (error) {
    console.error('Error deleteUserByAdmin:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pengguna: ' + error.message });
  }
};
