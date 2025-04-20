import { useState } from 'react';
import axios from 'axios';

export default function MatchPage() {
  const [interest, setInterest] = useState('');
  const [results, setResults] = useState([]);

  const handleMatch = async () => {
    try {
      const response = await axios.post('http://localhost:3002/match', {
        interest: interest.split(',').map(item => item.trim()),
      });
      setResults(response.data.matches);
    } catch (err) {
      alert('Gagal mencari mentor');
    }
  };

  return (
    <div>
      <h1>Mentor Match Finder</h1>
      <input
        type="text"
        placeholder="Contoh: JavaScript, UI/UX"
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
      />
      <button onClick={handleMatch}>Cari Mentor</button>

      <div>
        {results.map((mentor, index) => (
          <div key={index}>
            <h3>{mentor.name}</h3>
            <p>Expertise: {mentor.expertise?.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
