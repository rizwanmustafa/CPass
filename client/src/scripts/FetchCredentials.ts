import axios from "axios";
import { ICredential } from "../../types";

const FetchCredentials = async (userId: string, masterPassword: string): Promise<ICredential[]>=> {
	try{
		const fetchData = await axios.get(`http://localhost:5000/getCredentials/${userId}/${masterPassword}`)

		return fetchData.data;
	}
	catch(error){
		console.error("Could not fetch user credentials!", error)
		return [];
	}
}

export default FetchCredentials;