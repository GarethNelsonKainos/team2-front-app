
import { loginUser } from "../services/loginService";

export async function handleLogin(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('#loginEmail') as HTMLInputElement)?.value.trim();
    const password = (form.querySelector('#loginPassword') as HTMLInputElement)?.value;

    // Simple validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        const response = await loginUser(email, password);
        // Assuming the backend returns a token on success
        if (response.data && response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            window.location.href = '/';
        } else {
            alert('Login failed: Invalid response.');
            return;
        }
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            alert('Login failed: ' + error.response.data.error);
        } else { alert('Login failed: ' + error.message); }
    }
}