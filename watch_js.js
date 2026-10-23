// 监听 index.js变化，然后重新运行它
const fs = require('fs');
const { spawn } = require('child_process');

let serverProcess = null;

function startServer() {
    if (serverProcess) {
        serverProcess.kill();
    }
    serverProcess = spawn('node', ['index.js']);
    serverProcess.stdout.on('data', (data) => console.log(data.toString()));
    serverProcess.stderr.on('data', (data) => console.error(data.toString()));
}

startServer();

fs.watch('index.js', (eventType, filename) => {
    if (eventType === 'change') {
        console.log('index.js 已修改，重新启动服务器...');
        startServer();
    }
});
