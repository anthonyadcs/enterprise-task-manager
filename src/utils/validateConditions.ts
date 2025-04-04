import { APIError } from "@errors/apiError";

type Condition = { condition: any; toThrow: APIError };

export class ConditionsValidator {
	private conditions: Condition[] = [];

	constructor(conditions: Condition[]) {
		this.conditions = conditions;
	}

	validate(): void {
		for (const error of this.conditions) {
			if (error.condition) {
				throw error.toThrow;
			}
		}
	}
}
