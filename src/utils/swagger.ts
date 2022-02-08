import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

let server;
switch (process.env.NODE_ENV) {
  case 'production':
    server = { url: 'https://payment-demo-api.herokuapp.com/api/v1', description: 'Deployed production ready app app on Heroku' };
    break;
  default:
    server = { url: 'http://localhost:5000/api/v1', description: 'Local development/testing app' };
}

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Payment Demo REST API', // Title of the documentation
    version: '1.0.0', // Version of the app
    description: 'REST API for a payment demo app', // short description of the app
  },
  servers: [server],
  components: {
    securitySchemes: {
      headerAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'token',
      },
    },
  },
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ['./docs/**/*.yml'],
};
// initialize swagger-jsdoc
export default {
  setup: swaggerUI.setup(swaggerJSDoc(options)),
  serve: swaggerUI.serve,
};
