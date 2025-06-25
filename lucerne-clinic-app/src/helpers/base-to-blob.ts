export const b64toBlob = (base64: string) => fetch(base64).then(res => res.blob())

export const blobToBase64 = async (blob: Blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

export async function blobUrlToBase64(blobUrl: string) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result;
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


export async function getBlobUrlFileSize(blobUrl: string) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const fileSizeInBytes = blob.size;
    return fileSizeInBytes;
}

export const base64ToArrayBuffer = async (base64: string) => {
    const response = await fetch(base64);
    const data = await response.blob();
    return await data.arrayBuffer();
}

export function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);

// Convert Uint8Array to string
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }

// Convert binary string to Base64
    return  btoa(binaryString);
}
