import axios from "axios";

const FetchGeneratedPassword = async (length: number, lowercase: boolean, uppercase: boolean, numbers: boolean, specials: boolean): Promise<string> => {
	if (length > 50 || length < 8) return "";

	if (!lowercase && !uppercase && !numbers && !specials)
		return "";

	const passwordData: object = {
		length: length,
		lowercase: lowercase,
		uppercase: uppercase,
		numbers: numbers,
		specials: specials,
	}

	try {
		const fetchData = await axios.post("http://localhost:5000/generatepassword/", passwordData)

		return fetchData.data;
	}
	catch (error) {
		console.error("Could not fetch generated password!", error);
		return "";
	}
}

export default FetchGeneratedPassword;