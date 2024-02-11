import { ValidationError } from "@nestjs/common";

export const formatValidationErrors = (errors: ValidationError[]) => {
	return errors.map((error) => {
		// Extract the first constraint message for simplicity
		const message = error.constraints
			? error.constraints[Object.keys(error.constraints)[0]]
			: "Validation error";
		return { property: error.property, message };
	});
};
