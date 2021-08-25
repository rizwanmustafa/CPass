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
	type: ServerResponseType;
	heading?: string;
	body?: string;
	data?: string;
}