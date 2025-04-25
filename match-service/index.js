const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Base URL langsung ke Railway (tanpa tergantung .env)
const menteeServiceUrl = 'https://mentormatchmentee-service-production.up.railway.app';
const mentorServiceUrl = 'https://mentormatch-mentor-service.up.railway.app';

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
    const menteeResponse = await axios.get(`${menteeServiceUrl}/mentees/${menteeId}`);
    const mentee = menteeResponse.data;

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee tidak ditemukan' });
    }

    const interest = mentee.interest;

    if (!Array.isArray(interest) || interest.length === 0) {
      return res.status(400).json({ message: 'Mentee tidak memiliki interest yang valid' });
    }

    const mentorResponse = await axios.get(`${mentorServiceUrl}/mentors`);
    const mentors = mentorResponse.data;

    const matchedMentors = mentors.filter(mentor => {
      const expertiseList = Array.isArray(mentor.expertise) ? mentor.expertise : [];
      return interest.some(i => expertiseList.includes(i));
    });

    const scoredMentors = matchedMentors.map(mentor => {
      const expertiseList = Array.isArray(mentor.expertise) ? mentor.expertise : [];
      const matchCount = interest.filter(i => expertiseList.includes(i)).length;
      const score = (matchCount / interest.length * 100).toFixed(2);

      return {
        ...mentor,
        matchScore: parseFloat(score),
        matchedExpertise: interest.filter(i => expertiseList.includes(i))
      };
    });

    scoredMentors.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ mentee, matches: scoredMentors });

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
    const mentorResponse = await axios.get(`${mentorServiceUrl}/mentors/${mentorId}`);
    if (!mentorResponse.data) {
      return res.status(404).json({ message: 'Mentor tidak ditemukan' });
    }

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

// GET /mentee-matches/:menteeId
app.get('/mentee-matches/:menteeId', async (req, res) => {
  const { menteeId } = req.params;

  try {
    const menteeResponse = await axios.get(`${menteeServiceUrl}/mentees/${menteeId}`);
    const mentee = menteeResponse.data;

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee tidak ditemukan' });
    }

    if (!mentee.mentorId) {
      return res.json({ mentee, assignedMentor: null, status: 'unassigned' });
    }

    const mentorResponse = await axios.get(`${mentorServiceUrl}/mentors/${mentee.mentorId}`);
    const mentor = mentorResponse.data;

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor yang di-assign tidak ditemukan' });
    }

    res.json({ mentee, assignedMentor: mentor, status: 'assigned' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mendapatkan informasi match', details: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`MatchService running on port ${PORT}`);
});
