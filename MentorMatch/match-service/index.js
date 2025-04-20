require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// POST /match -> Cari mentor yang sesuai minat mentee
app.post('/match', async (req, res) => {
  const { interest } = req.body;

  if (!Array.isArray(interest) || interest.length === 0) {
    return res.status(400).json({ message: 'Interest harus berupa array dan tidak boleh kosong.' });
  }

  try {
    // Ambil semua mentor dari mentor-service
    const response = await axios.get(`${process.env.MENTOR_SERVICE_URL}/mentors`);
    const mentors = response.data;

    // Cari mentor yang memiliki expertise yang cocok dengan interest mentee
    const matchedMentors = mentors.filter(mentor => {
      const expertiseList = Array.isArray(mentor.expertise) ? mentor.expertise : [];
      // Mengecek jika ada minat yang cocok (dapat lebih dari satu hasil)
      return interest.some(i => expertiseList.includes(i));
    });
    
    

    res.json({ matches: matchedMentors });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal melakukan pencocokan mentor', details: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`MatchService running on port ${PORT}`);
});


//ini debug yak yang bawah (nyoba url)

// const express = require('express');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3002;

// app.get('/match', (req, res) => {
//   res.send('Match service is working!');
// });

// app.listen(PORT, () => {
//   console.log(`MatchService running at http://localhost:${PORT}`);
// });
