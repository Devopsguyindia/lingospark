const { execSync } = require('child_process');
try {
    const output = execSync('npx -y @railway/cli list --json').toString();
    const data = JSON.parse(output);
    console.log(JSON.stringify(data, null, 2));
} catch (e) {
    console.error(e.message);
}
