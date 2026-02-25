import axios from "axios";
import { UserInterface } from "../types/type";

const uri = process.env.BACKEND_URL;

export const userService = {
    async getAllUsers(){
        const response = await axios.get(`${uri}/users`);
        return response.data;
    },

    async getUserById(id: string){
        const response = await axios.get(`${uri}/users/${id}`);
        return response.data;
    },

    async register(user: UserInterface){
        const response = await axios.post(`${uri}/auth/register`, user);
        return response.data;
    },

    async login(user: UserInterface){
        const response = await axios.post(`${uri}/auth/login`, user);
        return response.data;
    },

    async update(id: string, user: UserInterface){
        const response = await axios.put(`${uri}/users/${id}`, user);
        return response.data;
    },

    async delete(id: string){
        const response = await axios.delete(`${uri}/users/${id}`);
        return response.data;
    }
}