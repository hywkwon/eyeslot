const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <html>
      <body>
        <h1>테스트 서버 동작 중! 🎉</h1>
        <p>포트 3001에서 정상적으로 실행되고 있습니다.</p>
        <p>시간: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

server.listen(3001, '0.0.0.0', () => {
  console.log('✅ 테스트 서버가 http://localhost:3001 에서 실행 중입니다!');
  console.log('✅ 브라우저에서 http://localhost:3001 로 접속해보세요.');
});

server.on('error', (err) => {
  console.error('❌ 서버 에러:', err);
});