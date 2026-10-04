const http = require('http');

function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Testing all user logins...\n');
  
  const users = [
    { email: 'admin@clinic.test', password: 'Admin123!' },
    { email: 'staff@clinic.test', password: 'Staff123!' },
    { email: 'patient@clinic.test', password: 'Patient123!' }
  ];
  
  for (const user of users) {
    const result = await apiLogin(user.email, user.password);
    if (result.success && result.data?.user) {
      console.log(`${user.email}:`);
      console.log(`  Role: ${result.data.user.role}`);
      console.log(`  Name: ${result.data.user.fullName}`);
    } else {
      console.log(`${user.email}: FAILED - ${result.message}`);
    }
  }
}

main().catch(console.error);
