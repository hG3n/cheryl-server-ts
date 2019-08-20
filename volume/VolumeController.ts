import {Request, Response} from 'express';
import {exec} from 'child_process';
import {constants} from '../constants';
import {extractVolumeLevel} from "../lib/Util";

export const volume = async (req: Request, res: Response): Promise<Response> => {
    try {
        let result = await getSystemVolume();
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing command!"});

    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const discrete = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result: Promise<any> = await setSystemVolume(req.params['volume']);
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing command!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const raise = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result: Promise<any> = await setRelativeSystemVolume('+', req.body.precision);
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error setting value!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const lower = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result: Promise<any> = await setRelativeSystemVolume('-', req.body.precision);
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error setting value!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const mute = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result: Promise<any> = await muteSystem();
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing Command"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const setSystemVolume = (volume): Promise<any> => {
    const command: string= constants.commands.volume.set + ` ${volume}%`;
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("Error executing:", command);
                reject({success: false})
            }
            resolve(extractVolumeLevel(stdout));
        });
    });
};

function getSystemVolume() {
    const command: string= constants.commands.volume.get;
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.warn("Error executing:", command);
                reject();
            }
            resolve(extractVolumeLevel(stdout));
        });
    });
}


function setRelativeSystemVolume(prefix, precise): Promise<any> {
    let value: string = precise ? '2%' : '5%';
    const command: string = constants.commands.volume.set + ` ${value}${prefix}`;
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("Error executing:", command);
                reject();
            }
            resolve(extractVolumeLevel(stdout));
        });

    });
}

function muteSystem(): Promise<any> {
    const command: string= constants.commands.volume.toggle;
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("Error executing:", command);
                reject();
            }
            resolve(extractVolumeLevel(stdout));
        });
    });
}

