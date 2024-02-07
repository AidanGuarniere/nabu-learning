# nabu

nabu is an open-source learning tool I built to make studying easier.

(these docs are out of date! missing Supabase-related instructions. if you're interested in utilizing this code, feel free to reach out and I'll help you get started with it.)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js >= 14
- An [OpenAI API Key](https://platform.openai.com/account/api-keys)
- A [MongoDB database](https://www.mongodb.com/)
- A [Redis instance](https://redis.io/)

## Technologies Used

- [Next.js](https://nextjs.org/) - A React-based framework for building server-side rendered and statically exported web applications
- [OpenAI LLMs](https://platform.openai.com/docs/models/overview) - Large language models developed by OpenAI
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom user interfaces
- [Axios](https://github.com/axios/axios) - A popular library for making HTTP requests in JavaScript
- [NextAuth.js](https://next-auth.js.org/) - A complete authentication solution for Next.js applications
- [MongoDB](https://www.mongodb.com/) - A popular NoSQL database used for storing user information
- [Mongoose](https://mongoosejs.com/) - An Object Data Modeling (ODM) library for MongoDB and Node.js
- [Redis](https://redis.io/) - An in-memory data structure store, used as a database, cache, and message broker
- [Crypto](https://nodejs.org/api/crypto.html) - A built-in Node.js module for handling cryptographic operations
- [Supabase](https://supabase.com/) - An open source Firebase alternative


## Setup 

### MongoDB Setup

We use MongoDB for storing user information and session data. You can set up a MongoDB instance in several ways:

- Download and install MongoDB directly on your local machine.
- Use a Docker container to run MongoDB.
- Use a managed MongoDB service, like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), which offers a free tier.

Once you have a running MongoDB instance, you'll need to obtain the connection string. If you're using MongoDB Atlas, you can find the connection string in your cluster's connection settings.

### Redis Setup

We use Redis for rate limiting in our API routes (currently disabled). You can set up a Redis instance in several ways, including:

- Download and install Redis directly on your local machine (not recommended for Windows users).
- Use a Docker container to run Redis.
- Use a managed Redis service, like [RedisLabs](https://redislabs.com/), which offers a free tier.

Once you have a running Redis instance, you'll need to obtain the connection string. If you're using RedisLabs, you can find the connection string in your database's configuration page.

## Installation

1. Clone or fork this repository

2. Navigate to the project directory:

   ```
   cd your_path/nabu-learning
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Create a `.env.local` file in the project root and add the necessary environment variables:

   ```
   touch .env.local
   ```

   Add the following to the `.env.local` file:

   ```
   NEXTAUTH_URL=http://localhost:3000
   MONGODB_URI=yourURI
   NEXTAUTH_SECRET=yourSecret
   REDIS_URL=yourRedisConnectionString
   ```

Replace `http://localhost:3000` with whatever port or URL your application is running on, `yourURI` with your MongoDB connection string, `yourSecret` with a secure random string, and `yourRedisConnectionString` with your Redis connection string.

...

## Usage

- To run the development server:

  ```
  npm run dev
  ```

- To build the application for production:

  ```
  npm run build
  ```

- To start the production server:

  ```
  npm run start
  ```

## Deployment

To deploy your nabu Clone to Vercel, follow these steps:

1. Sign up for a [Vercel](https://vercel.com/) account if you haven't already.

2. Install the Vercel CLI:

   ```
   npm install -g vercel
   ```

3. Log in to your Vercel account from the command line:

   ```
   vercel login
   ```

4. Navigate to your project directory:

   ```
   cd nabu
   ```

5. Run the following command to deploy your application:

   ```
   vercel --prod
   ```

6. During the deployment process, the Vercel CLI will ask you for the environment variables. Provide the same values you used for your `.env.local` file:

   ```
   NEXTAUTH_URL: https://your-vercel-url.vercel.app
   MONGODB_URI: yourURI
   NEXTAUTH_SECRET: yourSecret
   REDIS_URL=yourRedisConnectionString
   ```

Replace `http://localhost:3000` with whatever port your application is running on, `yourURI` with your MongoDB connection string, `yourSecret` with a secure random string, and `yourRedisConnectionString` with your Redis connection string.

7. Once the deployment is complete, Vercel will provide you with a live URL to access your nabu Clone.

Remember that every time you make changes to your nabu Clone and want to deploy the updated version, you can simply run `vercel --prod` from the project directory.


## License

This project is licensed under the MIT License.
