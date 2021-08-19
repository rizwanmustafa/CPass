const FetchGeneratedPassword = async (length: number, lowercase: boolean, uppercase: boolean, numbers: boolean, specials: boolean): Promise<string | null>=> {
	if (length > 50 || length < 8) return "";

	if (!lowercase && !uppercase && !numbers && !specials)
		return "";

	const passwordData : object = {
		length: length,
		lowercase: lowercase,
		uppercase: uppercase,
		numbers: numbers,
		specials: specials,
	}

	try{
		const fetchData = await fetch("http://localhost:5000/generatepassword/", {
			method: "POST",
			body: JSON.stringify(passwordData),
			headers: {
				"Content-Type": "application/json",
			},
		});
		
		const generatedPassword : string= await fetchData.json();
		
		return generatedPassword;
	}
	catch(error){
		console.error("There was an error while fetching generated password: ", error);
		return null;
	}
}

export default FetchGeneratedPassword;