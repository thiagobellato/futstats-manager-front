const axios = require('axios');

async function check() {
  try {
    const [atletas, clubes, estats] = await Promise.all([
      axios.get('http://localhost:8080/api/atleta'),
      axios.get('http://localhost:8080/api/clube'),
      axios.get('http://localhost:8080/api/estatistica')
    ]);

    console.log('--- ATLETA [0] ---');
    console.log(JSON.stringify(atletas.data[0], null, 2));
    
    console.log('--- CLUBE [0] ---');
    console.log(JSON.stringify(clubes.data[0], null, 2));

    console.log('--- ESTATISTICA [0] ---');
    console.log(JSON.stringify(estats.data[0], null, 2));

  } catch (e) {
    console.error(e.message);
  }
}

check();
