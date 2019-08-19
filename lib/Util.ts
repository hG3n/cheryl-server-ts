export const extractVolumeLevel = (stdout)  => {
    const lines = stdout.split("\n");

    let line_nr = 0;
    for (const line of lines) {
        const res = line.indexOf('Mono:');
        if (res > 0) {
            break
        }
        ++line_nr;
    }

    const left_line = lines[line_nr + 1];
    const left_muted = left_line.includes('[off]');
    const right_line = lines[line_nr + 2];
    const right_muted = right_line.includes('[off]');
    const left_splitted = left_line.split("Playback")[1];
    const right_splitted = right_line.split("Playback")[1];
    const left = parseInt(findVolumeLevel(left_splitted));
    const right = parseInt(findVolumeLevel(right_splitted));

    return {
        left: {pct: left, muted: left_muted},
        right: {pct: right, muted: right_muted},
        master: {pct: (left + right) / 2, muted: left_muted && right_muted}
    };
};

export const findVolumeLevel = (array) => {
    const val_start = array.indexOf('[');
    const val_end = array.indexOf(']');
    const diff = val_end - val_start;
    if (diff === 3) {
        return `${array[val_start + 1]}`
    } else if (diff === 4) {
        return `${array[val_start + 1]}${array[val_start + 2]}`
    }
    return `${array[val_start + 1]}${array[val_start + 2]}${array[val_start + 3]}`;
};
