# team2-front-app
Team 2 Frontend Application Feb/March 2026

## Environment Setup
Create a `.env` file in the project root with the following content:
```env
API_BASE_URL="http://localhost:3000"
```
> If your backend server is running on a different port, update the '3000' in `API_BASE_URL` accordingly.

Additionally, add `PORT` to the `.env` file if you want to specify a custom port for the frontend server (default is 3001):
```env
PORT=1234
```

**DO NOT** commit the `.env` file to version control, as it may contain sensitive information. The `.gitignore` file is already configured to ignore it.

## API (Backend)
The backend is located in a separate [GitHub Repo](https://github.com/GarethNelsonKainos/team2-back-app). **The backend server must be running before the frontend application can function.** Please refer to that repository for instructions on how to set up and run the backend.

If, for any reason, you are unable to run the backend server, you can use the provided mock backend for testing purposes. To enable the mock backend, use the command:
```sh
node .github/mock-backend.js
```

## Using the UI (Frontend)
Install dependencies:

```sh
npm install
```

Run in development mode (with hot reload):

```sh
npm run dev
```

Build the application:

```sh
npm run build
```

Run the production build:

```sh
npm start
```

Run tests:

```sh
npm run test
```

View tests with coverage:

```sh
npm run test:coverage
```

Run linting and formatting checks:

```sh
npm run lint
npm run format:check
```

---
After running the frontend application, you can access it in your web browser at `http://localhost:3001` (or the port you specified in the `.env` file). The frontend will communicate with the backend API to fetch and display data as needed.
