import { ICredential } from "../../types";

const FetchCredentials = async (userId: string, masterPassword: string): Promise<ICredential> => {
	const fetchURL = `http://localhost:5000/getCredentials/${userId}/${masterPassword}`;

	const fetchData = await fetch(fetchURL, {
		method: "GET",
		mode: "cors",
	})

	const jsonData: ICredential = await fetchData.json();

	return jsonData;
}

export default FetchCredentials;