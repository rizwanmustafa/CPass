import { ICredential } from "../../types";

const FetchCredentials = async (userId: string, masterPassword: string): Promise<ICredential[]>=> {
	try{
		const fetchURL = `http://localhost:5000/getCredentials/${userId}/${masterPassword}`;
		
		const fetchData = await fetch(fetchURL);
		
		const userCredentials: ICredential[] = await fetchData.json();
		
		return userCredentials;
	}
	catch(error){
		console.error("There was an error while fetching user credentials: ", error)
		return [];
	}
}

export default FetchCredentials;