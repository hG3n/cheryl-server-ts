import {Request, Response} from 'express';
import {exec} from 'child_process';
import {constants} from '../constants';

export const volume = async (req: Request, res: Response) => {
    try {
        let result = await getSystemVolume();
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing command!"});

    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const discrete = async (req: Request, res: Response) => {
    try {
        const result = await setSystemVolume(req.params['volume']);
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing command!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const raise = async (req: Request, res: Response) => {
    try {
        const result = await setRelativeSystemVolume('+', req.body.precision);
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error setting value!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const lower = async (req: Request, res: Response) => {
    try {
        const result = await setRelativeSystemVolume('-', req.body.precision);
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error setting value!"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

export const mute = async (req: Request, res: Response) => {
    try {
        const result = await muteSystem();
        if (result) return res.status(200).send(result);
        return res.status(500).send({success: false, message: "Error executing Command"});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};


function setSystemVolume(volume) {
    const command = constants.commands.volume.set + ` ${volume}%`;
    console.log(command);
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("Error executing:", command);
                reject({success: false})
            }
            resolve(extractVolumeLevel(stdout));
        });
    });
}

function setRelativeSystemVolume(prefix, precise) {
    let value = precise ? '2%' : '5%';
    console.log('vol commands', constants.commands);
    const command = constants.commands.volume.set + ` ${value}${prefix}`;
    console.log('cmd', command);
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

function muteSystem() {
    console.log('dasa');
    const command = constants.commands.volume.toggle;
    console.log('mute command', command);
    console.log('hfhhfhf');
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

function getSystemVolume() {
    const command = constants.commands.volume.get;
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

function extractVolumeLevel(stdout) {

    const lines = stdout.split("\n");

    let line_nr = 0;
    for (const line of lines) {
        const res = line.indexOf('Mono:');
        if (res > 0) {
            break
        }
        ++line_nr;
    }

    // filter left and right lines
    const left_line = lines[line_nr + 1];
    const left_muted = left_line.includes('[off]');
    const right_line = lines[line_nr + 2];
    const right_muted = right_line.includes('[off]');
    const left_splitted = left_line.split("Playback")[1];
    const right_splitted = right_line.split("Playback")[1];
    const left = parseInt(findVolumeLevel(left_splitted));
    const right = parseInt(findVolumeLevel(right_splitted));

    return {
        levels: {
            left: {pct: left, muted: left_muted},
            right: {pct: right, muted: right_muted},
            master: {pct: (left + right) / 2, muted: left_muted && right_muted}
        }
    };
}

function findVolumeLevel(array) {
    const val_start = array.indexOf('[');
    const val_end = array.indexOf(']');
    const diff = val_end - val_start;
    if (diff === 3) {
        return `${array[val_start + 1]}`
    } else if (diff === 4) {
        return `${array[val_start + 1]}${array[val_start + 2]}`
    }
    return `${array[val_start + 1]}${array[val_start + 2]}${array[val_start + 3]}`;
}


