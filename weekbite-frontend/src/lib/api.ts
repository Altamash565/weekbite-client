import axios from 'axios';


export const api = axios.create({
    baseURL: (import.meta as any).env.NEXT_PUBLIC_API_URL,
    withCredentials: true, 
})
