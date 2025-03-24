import "express-async-errors";
import express from "express";
import { errorMiddleware } from "./middlewares/error";
import { employeeRoutes } from "routes/employeeRoutes";

const app = express();

app.use(express.json());
app.use("/api", employeeRoutes);

app.use(errorMiddleware);
app.listen(process.env.PORT, async () => console.log(`Listening on port ${process.env.PORT}`));
