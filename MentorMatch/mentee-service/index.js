require('dotenv').config();
const express = require('express');
const { Mentee, sequelize } = require('./models/mentee');
const { Op } = require('sequelize');
const app = express();

app.use(express.json());

// Cek koneksi ke database
sequelize.authenticate()
  .then(() => {
    console.log('Koneksi ke database berhasil!');
  })
  .catch((err) => {
    console.error('Gagal terhubung ke database:', err);
  });

// Sinkronisasi database
sequelize.sync()
  .then(() => {
    console.log('Database dan tabel sudah disinkronkan');
  })
  .catch((err) => {
    console.error('Gagal menyinkronkan tabel:', err);
  });

// POST tambah mentee
app.post('/mentees', async (req, res) => {
  try {
    const { email } = req.body;

    const existing = await Mentee.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email mentee sudah terdaftar' });
    }

    const mentee = await Mentee.create(req.body);
    res.status(201).json(mentee);
  } catch (err) {
    res.status(500).json({ error: 'Gagal tambah mentee', details: err.message });
  }
});

// GET semua mentee
app.get('/mentees', async (req, res) => {
  try {
    const mentees = await Mentee.findAll();
    res.json(mentees);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data mentee', details: err.message });
  }
});

// GET mentee berdasarkan ID
app.get('/mentees/:id', async (req, res) => {
  try {
    const mentee = await Mentee.findByPk(req.params.id);
    if (mentee) {
      res.json(mentee);
    } else {
      res.status(404).json({ message: 'Mentee tidak ditemukan' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data mentee', details: err.message });
  }
});

// GET mentee berdasarkan nama
app.get('/search/mentees', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Parameter nama diperlukan' });
    }

    const mentees = await Mentee.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`
        }
      }
    });

    if (mentees.length === 0) {
      return res.status(404).json({ message: 'Tidak ada mentee dengan nama tersebut' });
    }

    res.json(mentees);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mencari mentee berdasarkan nama', details: err.message });
  }
});

// GET mentee berdasarkan interest
app.get('/search/mentees/interest', async (req, res) => {
    try {
      const { interest } = req.query;
      if (!interest) {
        return res.status(400).json({ message: 'Parameter interest diperlukan' });
      }
  
      const mentees = await Mentee.findAll({
        where: {
          interest: {
            [Op.iLike]: `%${interest}%` // Pencarian berdasarkan interest dengan case-insensitive
          }
        }
      });
  
      if (mentees.length === 0) {
        return res.status(404).json({ message: 'Tidak ada mentee dengan interest tersebut' });
      }
  
      res.json(mentees);
    } catch (err) {
      res.status(500).json({ error: 'Gagal mencari mentee berdasarkan interest', details: err.message });
    }
  });

// PUT update mentee
app.put('/mentees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Cari mentee berdasarkan ID
    const mentee = await Mentee.findByPk(id);
    if (!mentee) {
      return res.status(404).json({ message: 'Mentee tidak ditemukan' });
    }

    // Cek apakah email baru sudah digunakan oleh mentee lain
    if (email && email !== mentee.email) {
      const existing = await Mentee.findOne({
        where: {
          email,
          id: { [Op.ne]: id }
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Email mentee sudah digunakan oleh mentee lain' });
      }
    }

    // Update data mentee
    await mentee.update(req.body);

    res.json({ message: 'Data mentee diperbarui', mentee });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui data mentee', details: err.message });
  }
});

// DELETE mentee berdasarkan ID
app.delete('/mentees/:id', async (req, res) => {
  try {
    const mentee = await Mentee.findByPk(req.params.id);
    if (!mentee) {
      return res.status(404).json({ message: 'Mentee tidak ditemukan' });
    }

    await mentee.destroy();
    res.json({ message: 'Mentee berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus mentee', details: err.message });
  }
});

// DELETE semua mentee
app.delete('/mentees', async (req, res) => {
    try {
      await Mentee.destroy({ 
        where: {}, 
        truncate: true,
        restartIdentity: true
      });
  
      res.json({ message: 'Semua mentee berhasil dihapus.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal hapus semua mentee', details: err.message });
    }
});

// Jalankan server
const PORT = process.env.PORT || 3003;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(PORT, HOST, () => {
  console.log(`MenteeService running at http://${HOST}:${PORT}`);
});