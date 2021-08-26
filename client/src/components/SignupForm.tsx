import { useState, useEffect, useRef } from "react";
import axios from "axios";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import clsx from "clsx";
import { IServerResponse, ServerResponseType } from "../types";
import { isAlphaNumeric, hasAlphaNumeric, isValidEmail } from "../scripts/DataValidation";
import { Typography } from "@material-ui/core";

const SignupForm = (): JSX.Element => {
	const classes = makeStyles((theme: Theme) => // This stores the classes used for styling the components
		createStyles({
			form: {
				display: "flex",
				flexDirection: "column",
				width: "50vw",
				maxWidth: "400px",
				boxShadow: "lightgrey 0px 0px 20px 0px",
				padding: 20,
				borderRadius: 10,
			},
			heading: {
				textAlign: "center",
				marginBottom: 30,
			},
			button: {
				position: "relative",
				marginBottom: 20,
			},
			progressBar: {
				position: 'absolute',
			},

			helperText: {
				textAlign: "center",
			},
			error: {
				color: "red",
			},
			successful: {
				color: "green",
			},
			warning: {
				color: "orange",
			},
		})
	)();

	interface IUserData {
		username: string | null;
		email: string | null;
		password: string | null;
	}

	const [userData, setUserData] = useState<IUserData>({
		username: null,
		email: null,
		password: null,
	});

	const [serverResponse, setServerResponse] = useState<IServerResponse>({})// This stores the latest server response
	const [requestInProcess, setRequestInProcess] = useState<Boolean>(false);
	const RegisterUser = async () => {
		// This method registers the user on the server and sets the server response for display
		setRequestInProcess(true);

		if (userData.username === null ||
			userData.email === null ||
			userData.password === null ||
			usernameError !== "" ||
			emailError !== "" ||
			passwordError !== "") {
			setUserData(prevState => {
				return {
					username: (prevState.username === null ? "" : prevState.username),
					email: (prevState.email === null ? "" : prevState.email),
					password: (prevState.password === null ? "" : prevState.password),
				}
			})

			setRequestInProcess(false);
			return;
		}

		try {
			const fetchData = await axios.post("http://localhost:5000/users/", userData)

			const serverMessage: object = await fetchData.data;

			setServerResponse(serverMessage)
		}
		catch (e) {
			console.error("Could not create user!", e)
			setServerResponse({ type: ServerResponseType.Error, body: "Could not connect to server!", })
		}
		finally {
			setRequestInProcess(false);
		}
	}

	const HandleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		// This method deals with changes in the value of Input Elements for forms

		const newUserData = {
			...userData,
			[e.target.id]: e.target.value
		}

		setUserData(newUserData)
	}

	const [usernameAvailable, setUsernameAvailable] = useState<Boolean>(true);
	const CheckUsernameAvailibility = async (username: string): Promise<boolean | null> => {
		// This method sends a request to an API by server to check if the current username is available
		try {
			const fetchData = await axios.get(`http://localhost:5000/usernameavailable?username=${username}`);

			return fetchData.data;
		}
		catch (error) {
			console.error("Could not check if the username is available!", error);

			return null;
		}
	}

	useEffect(() => {
		// Everytime the username changes update its availability status
		if (userData.username !== null && userData.username.trim() !== "")
			CheckUsernameAvailibility(userData.username).then(available => setUsernameAvailable(available));
	}, [userData.username])

	// Everytime username changes, make sure it is valid and available
	const [usernameError, setUsernameError] = useState<string>("");
	useEffect(() => {
		if (userData.username === null) return

		else if (userData.username.length > 50) setUsernameError("Username cannot be longer than 50 characters!")

		else if (userData.username.trim() === "") setUsernameError("Username cannot be empty or whitespace!")

		else if (!isAlphaNumeric(userData.username)) setUsernameError("Username must only be alphanumeric!")

		else if (!usernameAvailable) setUsernameError("Username is already taken!")

		else setUsernameError("")

	}, [userData.username, usernameAvailable])

	// Everytime email changes, make sure it is valid
	const [emailError, setEmailError] = useState<string>("");
	useEffect(() => {
		if (userData.email === null) return

		else if (userData.email.trim() === "") setEmailError("Email cannot be empty or whitespace!")

		else if (!isValidEmail(userData.email)) setEmailError("Invalid email entered!")

		else setEmailError("")

	}, [userData.email])

	// Everytime password changes, make sure it is valid
	const [passwordError, setPasswordError] = useState<string>("");
	useEffect(() => {
		if (userData.password === null) return

		else if (userData.password.trim() === "") setPasswordError("Password cannot be empty or whitespace!")

		else if (userData.password.length < 8) setPasswordError("Password must be at least 8 characters long!")

		else if (userData.password.length > 50) setPasswordError("Password must not be longer than 50 characters!")

		else if (!hasAlphaNumeric(userData.password)) setPasswordError("Password must contain alphanumeric characters!")

		else setPasswordError("")

	}, [userData.password])


	return (
		<form className={classes.form}>
			<Typography variant="h4" component="h1" className={classes.heading} color="textPrimary">Create your Account</Typography>

			<TextField
				variant="outlined"
				required label="Username"
				type="text"
				id="username"
				onChange={HandleInput}
				error={usernameError !== ""}
				helperText={usernameError}
				value={userData.username}
			/>

			<br />
			<TextField
				variant="outlined"
				required
				label="Email"
				type="email"
				id="email"
				onChange={HandleInput}
				error={emailError !== ""}
				helperText={emailError}
				value={userData.email}
			/>

			<br />
			<TextField
				variant="outlined"
				required
				label="Password"
				type="password"
				id="password"
				onChange={HandleInput}
				error={passwordError !== ""}
				helperText={passwordError}
				value={userData.password}
			/>

			<br />
			<Button
				variant="contained"
				color="primary"
				onClick={RegisterUser}
				className={classes.button}
				disabled={requestInProcess}
			>
				Sign Up
				{requestInProcess &&
					<CircularProgress
						size={24}
						className={classes.progressBar}
					/>
				}
			</Button>

			{
				serverResponse.body === undefined ||
				<Typography variant="body1" className={clsx({
					[classes.helperText]: true,
					[classes.successful]: serverResponse.type === ServerResponseType.Successful,
					[classes.error]: serverResponse.type === ServerResponseType.Error,
					[classes.warning]: serverResponse.type === ServerResponseType.Warning
				})}>
					{serverResponse.body}
				</Typography>
			}

		</form>
	);
}

export default SignupForm;