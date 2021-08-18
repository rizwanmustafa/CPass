const FetchGeneratedPassword = async (length: number, lowercase: boolean, uppercase: boolean, numbers: boolean, specials: boolean): Promise<string>=> {
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

	const fetchData = await fetch("http://localhost:5000/generatepassword/", {
		method: "POST",
		mode: "cors",
		body: JSON.stringify(passwordData),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const jsonData : string= await fetchData.json();

	return jsonData;
}

export default FetchGeneratedPassword;