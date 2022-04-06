import axios from "axios";
import { ICredential } from "../types";

const FetchCredentials = async (username: string, userToken: string): Promise<ICredential[]> => {
  try {
    const fetchData = await axios.post("http://localhost:5000/getCredentials/", {
      username: username,
      token: userToken,
    });

    return fetchData.data;
  }
  catch (error) {
    console.error("Could not fetch user credentials!", error);
    return [];
  }
};

export default FetchCredentials;