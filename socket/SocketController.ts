import {Request} from "express";

export const volume = (ws, req: Request) => {
    ws.on("open", () => {
        console.log('opened');
    });

    ws.on("message", (msg) => {
        console.log('message', msg);
    });

    ws.on("close", () => {
        console.log('closed');
    });
};

