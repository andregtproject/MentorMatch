require('dotenv').config();
const express = require('express');
const { Mentor, sequelize } = require('./models/mentor');
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

// POST tambah mentor
app.post('/mentors', async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Mentor.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Nama mentor sudah terdaftar' });
    }

    const mentor = await Mentor.create(req.body);
    res.status(201).json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Gagal tambah mentor', details: err.message });
  }
});

// GET semua mentor
app.get('/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.findAll();
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data mentor', details: err.message });
  }
});

// GET mentor berdasarkan ID
app.get('/mentors/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findByPk(req.params.id);
    if (mentor) {
      res.json(mentor);
    } else {
      res.status(404).json({ message: 'Mentor tidak ditemukan' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data mentor', details: err.message });
  }
});

// GET mentor berdasarkan nama
app.get('/search/name', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Parameter nama diperlukan' });
    }

    const mentors = await Mentor.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`
        }
      }
    });

    if (mentors.length === 0) {
      return res.status(404).json({ message: 'Tidak ada mentor dengan nama tersebut' });
    }

    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mencari mentor berdasarkan nama', details: err.message });
  }
});

// GET mentor berdasarkan expertise
app.get('/search/expertise', async (req, res) => {
  try {
    const { expertise } = req.query;

    if (!expertise) {
      return res.status(400).json({ message: 'Parameter expertise diperlukan' });
    }

    const mentors = await Mentor.findAll({
      where: {
        [Op.or]: [
          { expertise: { [Op.like]: `%;${expertise};%` } }, // Di tengah
          { expertise: { [Op.like]: `${expertise};%` } },   // Di awal
          { expertise: { [Op.like]: `%;${expertise}` } },   // Di akhir
          { expertise: { [Op.eq]: expertise } }             // Satu-satunya
        ]
      }
    });

    if (mentors.length === 0) {
      return res.status(404).json({ message: 'Tidak ada mentor dengan expertise tersebut' });
    }

    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mencari mentor berdasarkan expertise', details: err.message });
  } 
});

// PUT update mentor
app.put('/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Cari mentor berdasarkan ID
    const mentor = await Mentor.findByPk(id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor tidak ditemukan' });
    }

    // Cek apakah nama baru sudah digunakan oleh mentor lain
    if (name && name !== mentor.name) {
      const existing = await Mentor.findOne({
        where: {
          name,
          id: { [Op.ne]: id }
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Nama mentor sudah digunakan oleh mentor lain' });
      }
    }

    // Update data mentor
    await mentor.update(req.body);

    res.json({ message: 'Data mentor diperbarui', mentor });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui data mentor', details: err.message });
  }
});


// DELETE mentor berdasarkan ID
app.delete('/mentors/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findByPk(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor tidak ditemukan' });
    }

    await mentor.destroy();
    res.json({ message: 'Mentor berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus mentor', details: err.message });
  }
});

// DELETE semua mentor
app.delete('/mentors', async (req, res) => {
  try {
    await Mentor.destroy({ 
      where: {}, 
      truncate: true,
      restartIdentity: true // Otomatis reset sequence ke 1
    });

    res.json({ message: 'Semua mentor berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal hapus semua mentor', details: err.message });
  }
});

// Jalankan server
const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(PORT, HOST, () => {
  console.log(`MentorService running at http://${HOST}:${PORT}`);
});
