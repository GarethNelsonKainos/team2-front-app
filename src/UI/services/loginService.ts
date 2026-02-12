import axios from "axios";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export async function loginUser(email: string, password: string) {
    try {
        console.log('Attempting login for:', email);
        const response = await axios.post(`${API_BASE_URL}/login`, {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Failed to login');
    }
}