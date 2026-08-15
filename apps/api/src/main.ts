import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.router';
import { setupApolloServer } from './graphql/server';

async function bootstrap() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount REST routes under /api prefix
  app.use('/api', apiRouter);

  // Mount Apollo Server GraphQL endpoint under /graphql
  await setupApolloServer(app);

  const port = process.env['PORT'] || 3000;

  app.listen(port, () => {
    console.log(`🚀 Application REST API is running on: http://localhost:${port}/api`);
    console.log(`🚀 Application GraphQL Server is running on: http://localhost:${port}/graphql`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});

