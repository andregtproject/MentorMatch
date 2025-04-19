const express = require('express');
const app = express();
const { Mentor, sequelize } = require('./models/mentor');

app.use(express.json());
sequelize.sync();

// POST tambah mentor
app.post('/mentors', async (req, res) => {
    try {
      const { name } = req.body;
  
      // Pengecekan duplikasi nama mentor
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
  const mentors = await Mentor.findAll();
  res.json(mentors);
});

// GET mentor berdasarkan ID
app.get('/mentors/:id', async (req, res) => {
  const mentor = await Mentor.findByPk(req.params.id);
  if (mentor) {
    res.json(mentor);
  } else {
    res.status(404).json({ message: 'Mentor tidak ditemukan' });
  }
});

// GET mentor berdasarkan nama
app.get('/search/name', async (req, res) => {
  const { name } = req.query;
  const mentors = await Mentor.findAll({
    where: { name }
  });
  res.json(mentors);
});

// PUT update mentor
app.put('/mentors/:id', async (req, res) => {
  const mentor = await Mentor.findByPk(req.params.id);
  if (!mentor) {
    return res.status(404).json({ message: 'Mentor tidak ditemukan' });
  }
  await mentor.update(req.body);
  res.json({ message: 'Data mentor diperbarui', mentor });
});

// DELETE mentor berdasarkan ID
app.delete('/mentors/:id', async (req, res) => {
  const mentor = await Mentor.findByPk(req.params.id);
  if (!mentor) {
    return res.status(404).json({ message: 'Mentor tidak ditemukan' });
  }
  await mentor.destroy();
  res.json({ message: 'Mentor berhasil dihapus' });
});

// DELETE semua mentor + reset ID
app.delete('/mentors', async (req, res) => {
  try {
    await Mentor.destroy({ where: {}, truncate: true });
    await sequelize.query("DELETE FROM sqlite_sequence WHERE name='Mentors'");
    res.json({ message: 'Semua mentor berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal hapus semua mentor', details: err.message });
  }
});

app.listen(3001, () => {
  console.log('MentorService running at http://localhost:3001');
});
