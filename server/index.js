
require('dotenv').config();

import Routes from "./routes";
import Server from "./common/server";
const mongoose = require('mongoose');
const swaggerDefinition = {
  info: {
      title: process.env.SWAGGER_DEFINITION_TITLE,
      version: process.env.SWAGGER_DEFINITION_VERSION,
      description: process.env.SWAGGER_DEFINITION_DESCRIPTION
  },
  basePath: process.env.SWAGGER_DEFINITION_BASE_PATH,
  securityDefinitions: {
      tokenauth: {
          type: process.env.SWAGGER_SECURITY_DEFINITION_TYPE,
          name: process.env.SWAGGER_SECURITY_DEFINITION_NAME,
          in: process.env.SWAGGER_SECURITY_DEFINITION_IN
      }
  }
};
mongoose.set('strictQuery', false);
// const dbUrl = `mongodb://${Config.get("databaseHost")}:${Config.get(
//   "databasePort"
// )}/${Config.get("databaseName")}`;
const dbUrl =  process.env.DB_URL ;
const server = new Server()
  .router(Routes)
  .configureSwagger(swaggerDefinition)
  .handleError() 
  .configureDb(dbUrl)  
  .then((_server) => _server.listen( process.env.PORT));
export default server;
 