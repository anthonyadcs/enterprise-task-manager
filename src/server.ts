import "express-async-errors";
import express from "express";
import { errorMiddleware } from "./middlewares/error";
import { employeeRoutes } from "routes/employeeRoutes";
import { companyRoutes } from "routes/companyRoutes";

const app = express();

app.use(express.json());
app.use("/api", employeeRoutes);
app.use("/api", companyRoutes);

app.use(errorMiddleware);
app.listen(process.env.PORT, async () => {
	console.log(`Listening on port ${process.env.PORT}`);
});
