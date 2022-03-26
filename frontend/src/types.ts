export interface ICredential {
    title: string;
    username: string;
    email: string;
    password: string;
}

export enum ServerResponseType {
    Successful = 1,
    Error,
    Warning,
}

export interface IServerResponse {
    message: string
    data?: object;
}

export interface IUserData {
    username: string;
    email: string;
    password: string;
}
