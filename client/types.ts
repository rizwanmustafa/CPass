export interface ICredential {
	title: string;
	username: string;
	email: string;
	password: string;
}

export enum ServerResponseTime {
	Successful = 1,
	Error,
	Warning,
}

export interface IServerResponse {
	type: ServerResponseTime;
	heading?: string;
	body?: string;
	data?: string;
}