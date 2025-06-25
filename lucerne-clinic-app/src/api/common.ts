export const getApiUrl = () => {
    const url = localStorage.getItem('api_url');
    return url ? url : null;
}

export const getKeySession = () => {
    const key = localStorage.getItem('key_session');
    return key ? key : null;
}

export const getQRNumber = () => {
    const key = localStorage.getItem('qr_version');
    return key ? key : null;
}

export const getAuthCode = () => {
    const key = localStorage.getItem('auth_code');
    return key ? key : null;
}

export const getSystemCode = () => {
    const key = localStorage.getItem('system_code');
    return key ? key : null;
}

export const getCoupleData = () => {
    const key = localStorage.getItem('couple_data');
    return key ? key : null;
}


export const getMD5 = () => {
    const key = localStorage.getItem('md5');
    return key ? key : null;
}
