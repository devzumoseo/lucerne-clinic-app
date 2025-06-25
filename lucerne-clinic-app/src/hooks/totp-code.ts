import totp from "totp-generator";

export const totpCode = (UUID_SIGN: string): string | null => {

    const code = totp(UUID_SIGN, {digits: 6, algorithm: 'SHA-1'});
    return code ? String(code) : null;
}


