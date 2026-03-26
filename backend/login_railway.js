const { spawn } = require('child_process');
const ls = spawn('npx', ['-y', '@railway/cli', 'login'], { 
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
});

ls.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`STDOUT: ${output}`);
  if (output.includes('Open the browser?')) {
    ls.stdin.write('Y\n');
  }
});

ls.stderr.on('data', (data) => {
  console.log(`STDERR: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

setTimeout(() => {
    ls.kill();
    process.exit(0);
}, 120000);
