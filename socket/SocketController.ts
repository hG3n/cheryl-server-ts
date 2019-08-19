import {Message} from "./Message";
import {setSystemVolume} from "../volume/VolumeController";
import {setEqualizerLevel} from "../equalizer/EqualizerController";

export const discreteVolume = async (msg: Message) => {
    return await setSystemVolume(msg.data['volume']);
};

export const equalizerLevel = async (msg: Message) => {
    return await setEqualizerLevel(msg.data['position'], msg.data['value']);
};

