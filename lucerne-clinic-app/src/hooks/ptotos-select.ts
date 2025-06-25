import {b64toBlob} from "./document-scanner";
import {makeId} from "./make-id";
import AdvancedImagePicker from 'cordova-plugin-advanced-imagepicker';

export const getPhotosNatively = async ():Promise<File[] | null | undefined> => {

    await AdvancedImagePicker.present({
        mediaType: 'IMAGE',
        showCameraTile: false,
        asBase64: true,
        asJpeg: true,
        max: 20
    }, (images) => {
        let result: File[] = [];

        if(images?.length) {
            for(let img of images) {
                const blob = b64toBlob(img?.src, 'image/jpg');
                const file =  new File([blob], makeId(6) + '.jpg',{type: "image/jpg"});
                result.push(file);
            }
        }

        return result?.length ? result : null;
    },  (error) => {
        return null;
    });

    return undefined;
}
