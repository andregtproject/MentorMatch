require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Log environment variables untuk debugging
console.log("MENTEE_SERVICE_URL:", process.env.MENTEE_SERVICE_URL);
console.log("MENTOR_SERVICE_URL:", process.env.MENTOR_SERVICE_URL);

// Cek komunikasi endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'match-service' });
});

// POST /match -> Cari mentor yang sesuai minat mentee
app.post('/match', async (req, res) => {
  const { menteeId } = req.body;

  if (!menteeId) {
    return res.status(400).json({ message: 'MenteeId diperlukan' });
  }

  try {
    // Ambil data mentee dari mentee-service
    const menteeServiceUrl = process.env.MENTEE_SERVICE_URL || 'http://localhost:3003';
    const mentorServiceUrl = process.env.MENTOR_SERVICE_URL || 'http://localhost:3001';
    
    const menteeResponse = await axios.get(`${menteeServiceUrl}/mentees/${menteeId}`);
    const mentee = menteeResponse.data;
    
    if (!mentee) {
      return res.status(404).json({ message: 'Mentee tidak ditemukan' });
    }
    
    const interest = mentee.interest;
    
    if (!Array.isArray(interest) || interest.length === 0) {
      return res.status(400).json({ message: 'Mentee tidak memiliki interest yang valid' });
    }
    
    // Ambil semua mentor dari mentor-service
    const mentorResponse = await axios.get(`${mentorServiceUrl}/mentors`);
    const mentors = mentorResponse.data;

    // Cari mentor yang memiliki expertise yang cocok dengan interest mentee
    const matchedMentors = mentors.filter(mentor => {
      const expertiseList = Array.isArray(mentor.expertise) ? mentor.expertise : [];
      // Mengecek jika ada minat yang cocok (dapat lebih dari satu hasil)
      return interest.some(i => expertiseList.includes(i));
    });
    
    // Tambahkan skor kecocokan untuk setiap mentor
    const scoredMentors = matchedMentors.map(mentor => {
      const expertiseList = Array.isArray(mentor.expertise) ? mentor.expertise : [];
      // Hitung berapa banyak minat yang cocok
      const matchCount = interest.filter(i => expertiseList.includes(i)).length;
      // Hitung skor berdasarkan jumlah kecocokan dibagi jumlah total minat
      const score = (matchCount / interest.length * 100).toFixed(2);
      
      return {
        ...mentor,
        matchScore: parseFloat(score),
        matchedExpertise: interest.filter(i => expertiseList.includes(i))
      };
    });
    
    // Urutkan berdasarkan skor tertinggi
    scoredMentors.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ 
      mentee,
      matches: scoredMentors
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal melakukan pencocokan mentor', details: err.message });
  }
});

// POST /assign -> Assign mentor ke mentee
app.post('/assign', async (req, res) => {
  const { menteeId, mentorId } = req.body;
  
  if (!menteeId || !mentorId) {
    return res.status(400).json({ message: 'MenteeId dan MentorId diperlukan' });
  }
  
  try {
    const menteeServiceUrl = process.env.MENTEE_SERVICE_URL || 'http://localhost:3003';
    const mentorServiceUrl = process.env.MENTOR_SERVICE_URL || 'http://localhost:3001';
    
    // Verifikasi mentor ada
    const mentorResponse = await axios.get(`${mentorServiceUrl}/mentors/${mentorId}`);
    if (!mentorResponse.data) {
      return res.status(404).json({ message: 'Mentor tidak ditemukan' });
    }
    
    // Update mentee dengan mentorId
    await axios.put(`${menteeServiceUrl}/mentees/${menteeId}`, {
      mentorId: mentorId
    });
    
    res.json({ 
      message: 'Mentor berhasil ditugaskan ke mentee',
      menteeId,
      mentorId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mengassign mentor ke mentee', details: err.message });
  }
});

// GET /mentee-matches/:menteeId -> Nampilin mentor yang sudah di-assign ke mentee
app.get('/mentee-matches/:menteeId', async (req, res) => {
  const { menteeId } = req.params;
  
  try {
    const menteeServiceUrl = process.env.MENTEE_SERVICE_URL || 'http://localhost:3003';
    const mentorServiceUrl = process.env.MENTOR_SERVICE_URL || 'http://localhost:3001';
    
    // Ambil data mentee
    const menteeResponse = await axios.get(`${menteeServiceUrl}/mentees/${menteeId}`);
    const mentee = menteeResponse.data;
    
    if (!mentee) {
      return res.status(404).json({ message: 'Mentee tidak ditemukan' });
    }
    
    if (!mentee.mentorId) {
      return res.json({ 
        mentee,
        assignedMentor: null,
        status: 'unassigned'
      });
    }
    
    // Ambil data mentor yang di-assign
    const mentorResponse = await axios.get(`${mentorServiceUrl}/mentors/${mentee.mentorId}`);
    const mentor = mentorResponse.data;
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor yang di-assign tidak ditemukan' });
    }
    
    res.json({
      mentee,
      assignedMentor: mentor,
      status: 'assigned'
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mendapatkan informasi match', details: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`MatchService running on port ${PORT}`);
});