import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: "https://splitit-bzgr.onrender.com",
    withCredentials:true
})