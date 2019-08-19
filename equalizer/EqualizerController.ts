import {Request, Response} from "express";
import {exec} from 'child_process';
import {constants} from '../constants';
import {extractVolumeLevel} from "../lib/Util";

export const equalizers = async (req: Request, res: Response) => {
    try {
        let result = getEqualizerLevel();
        Promise.all(result).then(
            (values) => {
                return res.status(200).send(values);
            }
        );
        // return res.status(500).send({success: false, message: "Error executing command!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const value = async (req: Request, res: Response) => {
    try {
        const result = await setEqualizerLevel(req.params['position'], req.params['value']);
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing command!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

// export const presets = async (req: Request, res: Response) => {
//     try {
//         const result = await setRelativeSystemVolume('-', req.body.precision).then(
//             (value) => {
//                 if (value)
//                     return res.status(200).send(value);
//                 return res.status(500).send({success: false, message: "Error setting value!"});
//             },
//             () => {
//                 return res.status(500).send({success: false, message: "Error executing Command"});
//             }
//         );
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({result: {message: "There was an error importing the data!"}});
//     }
// };

export const getEqualizerLevel = () => {
    const levels: any = [];
    for (const element of constants.equalizer.frequencies) {
        const command = constants.commands.equalizer.get + ` "${element.property}"`;
        const p: Promise<any> = new Promise((resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.log("Error executing:", command);
                    reject();
                }
                const res = {
                    channel: element,
                    levels: extractVolumeLevel(stdout)
                };
                resolve(res);
            });

        });
        levels.push(p);
    }

    return levels;
};

export const setEqualizerLevel = (handle_position, level) => {
    const element = constants.equalizer.frequencies.find((el) => el.position === parseInt(handle_position));
    if (element === undefined || element === null)
        return Promise.reject(new Error(`Couldn't find element with handle_position ${handle_position}!`));
    const command = constants.commands.equalizer.set + ` "${element.property}" ${level}%`;
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("Error executing:", command);
                reject();
            }
            const res = {
                channel: element,
                levels: extractVolumeLevel(stdout)
            };
            resolve(res);
        });
    });
};
