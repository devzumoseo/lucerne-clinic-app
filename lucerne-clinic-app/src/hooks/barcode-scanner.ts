import {BarcodeScanner, SupportedFormat} from '@capacitor-community/barcode-scanner';
import {App} from "@capacitor/app";

const scan = async () => {
    let result = '';
    try {
        // @ts-ignore
        document.querySelector('body').classList.add('scanner-active');
        await BarcodeScanner.hideBackground();
        const data = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

        // stop scan
        await BarcodeScanner.showBackground()
        await BarcodeScanner.stopScan()

        // @ts-ignore
        document.querySelector('body').classList.remove('scanner-active');

        if(data.content) {
            result = data.content
        }
    } catch (e) {
        console.error('qr-scan ', e);
    }

    return result;
}

const checkPermission = async () => {
    let result = '';

    try {
        const status = await BarcodeScanner.checkPermission({ force: true })

        if (status.granted) {
            result = await scan();
        }

        if (status.denied) {
            alert('Bitte Kamera-Berechtigung in den APP-Einstellungen aktivieren');
            const check = await BarcodeScanner.checkPermission({ force: true })
            await BarcodeScanner.openAppSettings();
            check.denied && await App.exitApp();
        }

    } catch (error) {
        alert('error' + JSON.stringify(error))
    }

    return result;
}

export const startQrScanHook = async () => {
    let result = '';

    result = await checkPermission();

    return result;
};

export const stopQrScanHook = async () => {

    // stop scan
    await BarcodeScanner.showBackground()
    await BarcodeScanner.stopScan()

    // @ts-ignore
    document.querySelector('body').classList.remove('scanner-active');
};