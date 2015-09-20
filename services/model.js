import { Schema } from 'mongoose';

import * as subtitles from '../modules/models/subtitles.js';

export default function modelService(options, imports) {
  const { mongoose } = imports;

  const setup = function setup(modelName, module) {
    const schema = module.setupSchema();
    const model = new Schema(schema);

    module.setupModel(modelName, model);
    mongoose.model(modelName, model);
  };

  const service = {
    get(modelName) {
      return mongoose.model(modelName);
    }
  };

  setup('subtitles', subtitles);

  return Promise.resolve({ service });
}
