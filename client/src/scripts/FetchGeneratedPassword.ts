import axios from "axios";

const FetchGeneratedPassword = async (length: number, lowercase: boolean, uppercase: boolean, numbers: boolean, specials: boolean): Promise<string> => {
    if (length > 50 || length < 8) return "";

    if (!lowercase && !uppercase && !numbers && !specials)
        return "";

    try {
        const fetchURL = "http://localhost:5000/generatepassword";
        const fetchParameters = `?length=${length}&lowercase=${lowercase}&uppercase=${uppercase}&numbers=${numbers}&specials=${specials}`;

        const fetchData = await axios.get(fetchURL + fetchParameters);

        return fetchData.data;
    }
    catch (error) {
        console.error("Could not fetch generated password!", error);
        return "";
    }
}

export default FetchGeneratedPassword;