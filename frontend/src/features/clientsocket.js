import { io } from 'socket.io-client';

export const socket = io("https://splitit-bzgr.onrender.com", {
    autoConnect:true
})