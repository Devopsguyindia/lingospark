const { spawn } = require('child_process');
const ls = spawn('npx', ['-y', '@railway/cli', 'login', '--browserless'], { shell: true });

ls.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`STDOUT: ${output}`);
});

ls.stderr.on('data', (data) => {
  const output = data.toString();
  console.log(`STDERR: ${output}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

// Keep process alive
setTimeout(() => {
  console.log('Timeout reached');
  ls.kill();
  process.exit(0);
}, 60000);
