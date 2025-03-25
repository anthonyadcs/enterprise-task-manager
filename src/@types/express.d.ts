import { Employee } from "@prisma/client";

declare global {
	namespace Express {
		export interface Request {
			employee: Omit<Employee, "password">;
		}
	}
}

export {};
