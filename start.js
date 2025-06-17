const { spawn } = require('child_process');

const proc = spawn('npm', ['run', 'start'], {
  stdio: 'inherit',
  shell: true,
});