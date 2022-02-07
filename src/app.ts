import express, {
  json, urlencoded,
} from 'express';
import logger from 'morgan';
import cors from 'cors';

// import routes from './router';
// import swaggerSpec from './utils/swagger';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
// app.use('/api-docs', swaggerSpec.serve, swaggerSpec.setup);

// app.use('', routes);

export default app;
