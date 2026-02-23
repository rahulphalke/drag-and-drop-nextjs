const http = require('http');

http.get('http://localhost:5000/api/forms/2', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log('Error:', e.message);
      console.log('Raw:', data);
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
