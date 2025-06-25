import {makeId} from "./make-id";

export const srcToFile = async (url: string): Promise<File> => {
    const response  = await fetch(url);
    const content_type = response.headers.get('content-type');
    const blob = await response.blob();

    return  new File([blob], makeId(5) + '.jpg', { type: content_type ? content_type : '' })
}
