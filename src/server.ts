import express from 'express'
import { errorMiddleware } from './middlewares/error';

const app = express();

app.use(express.json())

app.use(errorMiddleware)
app.listen(process.env.PORT, () => console.log("Listening on port " + process.env.PORT))