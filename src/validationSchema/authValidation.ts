import * as yup from "yup";

// Validation schemas
const passwordSchema = yup
	.string()
	.required("Password is required")
	.min(9, "Password must be more than 8 characters")
	.max(100, "Password must not exceed 100 characters")
	.matches(/[a-z]/, "Password must contain at least one lowercase letter")
	.matches(/[A-Z]/, "Password must contain at least one uppercase letter")
	.matches(
		/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
		"Password must contain at least one special character",
	);

const loginSchema = yup.object().shape({
	email: yup
		.string()
		.email("Invalid email format")
		.required("Email is required"),
	password: yup.string().required("Password is required"),
});

const registrationSchema = yup.object().shape({
	firstName: yup
		.string()
		.min(2, "First name must be at least 2 characters")
		.required("First name is required"),
	secondName: yup
		.string()
		.min(2, "Last name must be at least 2 characters")
		.required("Last name is required"),
	email: yup
		.string()
		.email("Invalid email format")
		.required("Email is required"),
	password: passwordSchema,
	confirmedPassword: yup
		.string()
		.oneOf([yup.ref("password")], "Passwords must match")
		.required("Password confirmation is required"),
});

export { loginSchema, registrationSchema };
