import {datadogLogs} from "@datadog/browser-logs";

export const datadogInfo = (url: string, request: FormData, response: any) => {
    try {
        datadogLogs.logger.info(`Custom log ==> ${url}`, { request: JSON.stringify(Object.fromEntries(request)), response})

    } catch {}
}

export const datadogInfoUpload = async (url: string, message: any) => {
    try {
        datadogLogs.logger.debug(`Custom log upload ==> ${url}`, message)
    } catch {}
}

export const datadogError = (url: string,request: FormData, error: any) => {
    try {
        datadogLogs.logger.error(`Custom error ==> ${url}`, { request: JSON.stringify(Object.fromEntries(request)), errorData: error })

    } catch {}
}

export const datadogErrorPage = (url: string) => {
    try {
        datadogLogs.logger.error(`Error page ==> ${url}`)
    } catch {}
}
