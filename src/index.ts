import http from 'node:http';

import app from './app';

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
