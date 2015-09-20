import mongoose from 'mongoose';

export default function (options, imports) {
  const logger = imports.logger;
  const connection = mongoose.createConnection(options.host);

  const shutdown = function () {
    return new Promise(resolve => {
      connection.close(resolve);
    });
  };

  return new Promise((resolve, reject) => {
    connection
      .on('open', () => {
        logger.info('Mongoose connected to %s:%s', connection.host, connection.port);
        resolve({ service: connection, shutdown });
      })
      .on('error', error => {
        logger.error(error);
        reject(error);
      });
  });
}
