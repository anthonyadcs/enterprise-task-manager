import "express-async-errors";
import express from "express";
import { errorMiddleware } from "./middlewares/error";
import { employeeRoutes } from "routes/employeeRoutes";
import { companyRoutes } from "routes/companyRoutes";
import { prismaClient } from "dbConnection/prismaClient";

const app = express();

app.use(express.json());
app.use("/api", employeeRoutes);
app.use("/api", companyRoutes);

app.use(errorMiddleware);
app.listen(process.env.PORT, async () => {
	// await prismaClient.task.deleteMany({});

	const tasks = [
		{
			department: "MARKETING",
			priority: "HIGH",
			status: "PENDING",
			title: "Criar campanha para lançamento do produto X",
			startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "MEDIUM",
			status: "PARTIAL_DONE",
			title: "Atualizar calendário editorial",
			startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "CRITICAL",
			status: "DONE",
			title: "Corrigir erros no site da campanha",
			startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "LOW",
			status: "CANCELLED",
			title: "Organizar mural de inspirações visuais",
			startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "HIGH",
			status: "PARTIAL_CANCELLED",
			title: "Reformular identidade visual da newsletter",
			startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "MEDIUM",
			status: "DONE",
			title: "Criar templates para redes sociais",
			startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "CRITICAL",
			status: "PENDING",
			title: "Gerenciar crise nas redes sociais",
			startDate: new Date(),
			endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "LOW",
			status: "PARTIAL_DONE",
			title: "Fazer brainstorming de campanhas sazonais",
			startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "HIGH",
			status: "DONE",
			title: "Analisar métricas da última campanha",
			startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
		{
			department: "MARKETING",
			priority: "MEDIUM",
			status: "PARTIAL_CANCELLED",
			title: "Criar guia de branding para parceiros",
			startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
			endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
			staff: { connect: { id: "c3e3fe22-5810-4f97-83ea-f3a915d5f6b7" } },
			manager: { connect: { id: "dfa938d7-0a16-426c-bf1a-75b5b61632a9" } },
			company: { connect: { id: "90051ddb-7fff-4449-87cb-3189ff348ee6" } },
		},
	];

	for (const task of tasks) {
		await prismaClient.task.create({
			data: task,
		});
	}

	console.log(`Listening on port ${process.env.PORT}`);
});
