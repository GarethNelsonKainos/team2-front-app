import axios from "axios";

export async function loginUser(email: string, password: string) {
    console.log('login sent');
    return axios.post('/login', { email, password });
}