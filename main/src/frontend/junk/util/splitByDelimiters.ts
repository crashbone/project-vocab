export const splitByDelimiters = (string: string, delimiters: string[]) => {
    let result = [string];

    for (let i = 0; i < delimiters.length; i++) {
        let temp: string[] = [];
        for (let j = 0; j < result.length; j++) {
            temp = temp.concat(result[j].split(delimiters[i]));
        }
        result = temp;
    }

    return result;
}
