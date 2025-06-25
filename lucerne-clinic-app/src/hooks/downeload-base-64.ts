import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener';

export const downloadAsPDF = async (base64String: string, name: string) => {

    if (base64String.startsWith("JVB")) {
        base64String = "data:application/pdf;base64," + base64String;
        await downloadFileObject(base64String, name);
    } else {
        await downloadFileObject(base64String, name);
    }

}


const downloadFileObject = async (base64String: string, name: string) => {
    // const linkSource = base64String;
    // const downloadLink = document.createElement("a");
    const fileName = name + ".pdf";
    // downloadLink.href = linkSource;
    // downloadLink.download = fileName;
    // downloadLink.click();

    const result = await Filesystem.writeFile({
        data: base64String,
        path: fileName,
        directory: Directory.Documents,
    });

    // await FileOpener.showOpenWithDialog(result.uri, 'application/pdf');
    await FileOpener.open(result.uri, 'application/pdf');

}
