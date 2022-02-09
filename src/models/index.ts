/* eslint-disable no-console */
import mongoose from 'mongoose';

import Env from '../utils/Env';

const env = new Env();

// start mongo server with command 'sudo mongod --dbpath ~/data/db --replSet rs0'
mongoose.connect(
  env.databaseURL ?? '',
).catch(console.error);

if (process.env.NODE_ENV === 'development') {
  (async () => {
    const models: any = {};
    models.User = await (await import('./User')).default;
    models.Transaction = await (await import('./Transaction')).default;
    Object.values(models).forEach(async (model: any) => {
      await model.deleteMany({}).exec().catch(console.error);
    });
  })();
}

export default mongoose.connection;
