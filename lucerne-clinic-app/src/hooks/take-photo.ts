import {makeId} from "./make-id";
import {b64toBlob} from "./document-scanner";
import {Camera} from "@ionic-native/camera";
import {Filesystem} from "@capacitor/filesystem";
export const takePhotoFromCamera = async (): Promise<File | null> => {
    try {
        const photo: string = await Camera.getPicture({encodingType: Camera.EncodingType.JPEG});
        const fileBase64 = await Filesystem.readFile({path: photo});
        const blob = b64toBlob(fileBase64.data, 'image/jpg');

        return  new File([blob], makeId(6) + '.jpg',{type: "image/jpg"});
    } catch (e) {
        return  null;
    }
}
