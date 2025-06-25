export const  htmlDecode = (input: string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    const res =  doc.documentElement.textContent ? doc.documentElement.textContent : '';

    const gerDoc = new DOMParser().parseFromString(res, "text/html");
    return gerDoc.documentElement.textContent ? gerDoc.documentElement.textContent : '';
}