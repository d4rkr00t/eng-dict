import express from 'express';
import path from 'path';
import proxy from 'proxy-express';

import bodyParser from 'body-parser';

import responseHelpers from './response';

export default function (options, imports) {
  const { logger } = imports;

  const app = express();
  const port = process.env.NODE_PORT || options.port || 3333;

  const assetsPath = path.join(__dirname, '..', '..', 'assets');
  const publicPath = path.join(__dirname, '..', '..', 'public');

  app.use(bodyParser.json());
  app.use(responseHelpers());

  const faviconFile = path.join(assetsPath, 'favicon.ico');
  app.get('/favicon.ico', (req, res) => res.sendFile(faviconFile));

  if (process.env.WEBPACK) {
    app.use(proxy('localhost:8081', '/public'));
  } else {
    app.use('/public', express.static(publicPath));
  }

  const indexFile = path.join(assetsPath, 'index.html');
  app.get('*', (req, res) => res.sendFile(indexFile));

  return new Promise(provide => {
    const server = app.listen(port, () => {
      logger.info(
        'Server listening at %s:%s',
        server.address().address,
        server.address().port
      );

      const shutdown = () => {
        return new Promise((resolve, reject) => {
          server.close(error => {
            error ? reject(error) : resolve();
          });
        });
      };

      provide({ service: server, shutdown });
    });

  });
}
