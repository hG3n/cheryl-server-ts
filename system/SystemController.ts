import {Request, Response} from "express";
import {exec} from "child_process";
import {constants} from "../constants";
import {extractStatus, findVolumeLevel} from "../lib/Util";


export const restart = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await restartSpotifyClient();
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing command!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const status = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await getRaspotifyStatus();
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing command!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

function getRaspotifyStatus(): Promise<any> {
    const command = constants.commands.system.status;
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("Error executing:", command);
                reject({success: false});
            }
            const result = extractStatus(stdout);
            resolve(result);
        });
    });
}

function restartSpotifyClient(): Promise<any> {
    const command = constants.commands.system.restart;
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("Error executing:", command);
                reject({success: false});
            }
            resolve({success: true});
        });
    });
}
