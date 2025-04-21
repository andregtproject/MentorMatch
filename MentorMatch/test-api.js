// MentorMatch API Testing Script
const axios = require('axios');

// Service URLs
const MENTOR_SERVICE = 'http://localhost:3001';
const MENTEE_SERVICE = 'http://localhost:3003';
const MATCH_SERVICE = 'http://localhost:3002';

// Store IDs for reference between tests
const testData = {
  mentorIds: [],
  menteeIds: []
};

// Helper function to log results
const logResponse = (title, data) => {
  console.log('\n===================================');
  console.log(`${title}:`);
  console.log('===================================');
  console.log(JSON.stringify(data, null, 2));
};

// Helper function to handle errors
const handleError = (title, error) => {
  console.error(`\n❌ ERROR in ${title}:`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
  } else if (error.request) {
    console.error('No response received from server');
  } else {
    console.error(`Message: ${error.message}`);
  }
};

// Test Mentor Service
async function testMentorService() {
  try {
    console.log('\n🚀 TESTING MENTOR SERVICE');

    const getMentorsRes = await axios.get(`${MENTOR_SERVICE}/mentors`);
    logResponse('All mentors', getMentorsRes.data);

    const createMentor1Res = await axios.post(`${MENTOR_SERVICE}/mentors`, {
      name: "John Doe",
      expertise: ["JavaScript", "Node.js", "React"]
    });
    logResponse('Created mentor 1', createMentor1Res.data);
    testData.mentorIds.push(createMentor1Res.data.id);

    const createMentor2Res = await axios.post(`${MENTOR_SERVICE}/mentors`, {
      name: "Jane Smith",
      expertise: ["Python", "Data Science", "Machine Learning"]
    });
    logResponse('Created mentor 2', createMentor2Res.data);
    testData.mentorIds.push(createMentor2Res.data.id);

    const createMentor3Res = await axios.post(`${MENTOR_SERVICE}/mentors`, {
      name: "Robert Johnson",
      expertise: ["Java", "Spring Boot", "Database Design"]
    });
    logResponse('Created mentor 3', createMentor3Res.data);
    testData.mentorIds.push(createMentor3Res.data.id);

    const getMentorRes = await axios.get(`${MENTOR_SERVICE}/mentors/${testData.mentorIds[0]}`);
    logResponse(`Get mentor by ID ${testData.mentorIds[0]}`, getMentorRes.data);

    const searchMentorRes = await axios.get(`${MENTOR_SERVICE}/search/expertise?expertise=JavaScript`);
    logResponse('Search mentors with JavaScript expertise', searchMentorRes.data);

    const updateMentorRes = await axios.put(`${MENTOR_SERVICE}/mentors/${testData.mentorIds[0]}`, {
      expertise: ["JavaScript", "Node.js", "React", "Express"]
    });
    logResponse(`Update mentor ${testData.mentorIds[0]}`, updateMentorRes.data);

  } catch (error) {
    handleError('Mentor Service', error);
  }
}

// Test Mentee Service
async function testMenteeService() {
  try {
    console.log('\n🚀 TESTING MENTEE SERVICE');

    const getMenteesRes = await axios.get(`${MENTEE_SERVICE}/mentees`);
    logResponse('All mentees', getMenteesRes.data);

    const createMentee1Res = await axios.post(`${MENTEE_SERVICE}/mentees`, {
      name: "Alex Brown",
      email: "alex@example.com",
      interest: ["JavaScript", "React"],
      bio: "Computer Science student interested in web development."
    });
    logResponse('Created mentee 1', createMentee1Res.data);
    testData.menteeIds.push(createMentee1Res.data.id);

    const createMentee2Res = await axios.post(`${MENTEE_SERVICE}/mentees`, {
      name: "Taylor White",
      email: "taylor@example.com",
      interest: ["Python", "Data Science"],
      bio: "Statistics graduate looking to transition into data science."
    });
    logResponse('Created mentee 2', createMentee2Res.data);
    testData.menteeIds.push(createMentee2Res.data.id);

    const getMenteeRes = await axios.get(`${MENTEE_SERVICE}/mentees/${testData.menteeIds[0]}`);
    logResponse(`Get mentee by ID ${testData.menteeIds[0]}`, getMenteeRes.data);

    const updateMenteeRes = await axios.put(`${MENTEE_SERVICE}/mentees/${testData.menteeIds[0]}`, {
      interest: ["JavaScript", "React", "Node.js"]
    });
    logResponse(`Update mentee ${testData.menteeIds[0]}`, updateMenteeRes.data);

  } catch (error) {
    handleError('Mentee Service', error);
  }
}

// Test Match Service
async function testMatchService() {
  try {
    console.log('\n🚀 TESTING MATCH SERVICE');

    const matchRes = await axios.post(`${MATCH_SERVICE}/match`, {
      menteeId: testData.menteeIds[0]
    });
    logResponse(`Match mentee ${testData.menteeIds[0]} with mentors`, matchRes.data);

    const matchDiffRes = await axios.post(`${MATCH_SERVICE}/match`, {
      menteeId: testData.menteeIds[1]
    });
    logResponse(`Match mentee ${testData.menteeIds[1]} with mentors`, matchDiffRes.data);

    const assignRes = await axios.post(`${MATCH_SERVICE}/assign`, {
      menteeId: testData.menteeIds[0],
      mentorId: testData.mentorIds[0]
    });
    logResponse(`Assign mentor ${testData.mentorIds[0]} to mentee ${testData.menteeIds[0]}`, assignRes.data);

    const checkAssignRes = await axios.get(`${MATCH_SERVICE}/mentee-matches/${testData.menteeIds[0]}`);
    logResponse(`Check assignment for mentee ${testData.menteeIds[0]}`, checkAssignRes.data);

    const checkUnassignedRes = await axios.get(`${MATCH_SERVICE}/mentee-matches/${testData.menteeIds[1]}`);
    logResponse(`Check assignment for unassigned mentee ${testData.menteeIds[1]}`, checkUnassignedRes.data);

  } catch (error) {
    handleError('Match Service', error);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testMentorService();
    await testMenteeService();
    await testMatchService();
    console.log('\n✅ All tests completed');
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
  }
}

// Execute the tests
runAllTests();
