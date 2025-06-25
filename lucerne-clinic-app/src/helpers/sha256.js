export const SHA256 = async (message) => {
    try{
        const msgBuffer = new TextEncoder().encode(message);

        // hash the message
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        // convert bytes to hex string
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.toUpperCase();
    } catch (e) {
        console.log(e)
        // return '74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b';
        return ''
    }
}
