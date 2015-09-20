import intel from 'intel';

export default function loggerService(options) {
  const { transport } = options;
  const logger = intel.getLogger(transport ? transport.name : 'app');

  if (transport) {
    switch (transport.level) {
    case 'VERBOSE':
      logger.setLevel(intel.VERBOSE);
      break;
    case 'DEBUG':
      logger.setLevel(intel.DEBUG);
      break;
    case 'INFO':
      logger.setLevel(intel.INFO);
      break;
    case 'WARN':
      logger.setLevel(intel.WARN);
      break;
    case 'ERROR':
      logger.setLevel(intel.ERROR);
      break;
    case 'CRITICAL':
      logger.setLevel(intel.CRITICAL);
      break;
    case 'TRACE':
    default:
      logger.setLevel(intel.TRACE);
      break;
    }

    switch (transport.type) {
    case 'file':
      logger.addHandler(new intel.handlers.File(transport.path));
      break;
    default:
      break;
    }
  }

  return Promise.resolve({ service: logger });
}
