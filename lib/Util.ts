import * as moment from "moment";

export const extractVolumeLevel = (stdout: string): object => {
    const lines: string[] = stdout.split("\n");

    let line_nr = 0;
    for (const line of lines) {
        const res: number = line.indexOf('Mono:');
        if (res > 0) {
            break
        }
        ++line_nr;
    }

    const left_line: string = lines[line_nr + 1];
    const left_muted: boolean = left_line.includes('[off]');
    const right_line: string = lines[line_nr + 2];
    const right_muted: boolean = right_line.includes('[off]');
    const left_splitted: string = left_line.split("Playback")[1];
    const right_splitted: string = right_line.split("Playback")[1];
    const left: number = parseInt(findVolumeLevel(left_splitted));
    const right: number = parseInt(findVolumeLevel(right_splitted));

    return {
        left: {pct: left, muted: left_muted},
        right: {pct: right, muted: right_muted},
        master: {pct: (left + right) / 2, muted: left_muted && right_muted}
    };
};

export const findVolumeLevel = (array): string => {
    const val_start: number = array.indexOf('[');
    const val_end: number = array.indexOf(']');
    const diff: number = val_end - val_start;
    if (diff === 3) {
        return `${array[val_start + 1]}`
    } else if (diff === 4) {
        return `${array[val_start + 1]}${array[val_start + 2]}`
    }
    return `${array[val_start + 1]}${array[val_start + 2]}${array[val_start + 3]}`;
};

export const extractStatus = (stdout: string): object => {
    const lines: string[] = stdout.split("\n");
    const result = {
        status: '',
        memory: '',
        active_since: '',
        currently_playing: {
            title: '',
            uri: ''
        }
    };

    for (const line of lines) {
        if (line.includes('Active:')) {
            let line_splitted = line.split(':');
            let line_trimmed = line_splitted[1].trim();
            const active = line_trimmed.split(' ')[0];
            if (active === 'active') {
                const active_since = line.split('since')[1].split(';')[0].trim();
                const first_space_idx = active_since.indexOf(' ');
                const date_str = active_since.slice(first_space_idx+1, active_since.length);
                const mom = moment.default(date_str);
                console.log(mom);
                result.active_since = date_str;
            }

            result.status = active.trim().toLowerCase();
        } else if (line.includes('Memory:')) {
            let line_splitted = line.split(':');
            let line_trimmed = line_splitted[1].trim();
            result.memory = line_trimmed;
            break;
        }
    }

    const playback_lines = stdout.split('\n\n').reverse();
    let recent_uri = playback_lines[0].split('URI').reverse()[0].trim();
    recent_uri = recent_uri.split('\n')[0].replace('"', '');
    result.currently_playing.uri = recent_uri.slice(1, recent_uri.length - 1);

    return result;
};
