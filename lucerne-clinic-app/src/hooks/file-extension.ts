export const isExtensionWrong = (ex_str: string, files: Array<File>): undefined | string => {
    let wrong_exp;

    files.map(file => {
        const check = file.name.split('.').pop();

        if(check) {
            if(!ex_str.includes(check)) {
                wrong_exp = check;
            }
        }
    })

    return wrong_exp;
}

export const isFileSizeWrong = (maxSize: number, files: Array<File>): null | number => {
    for (const file of files) {
        const check = file.size > maxSize;

        if(check) {
            return file.size;
        }
    }

    return null;
}