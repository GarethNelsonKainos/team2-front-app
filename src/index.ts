import express from 'express';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000

app.use(express.json());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
res.send('Hello world!');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})