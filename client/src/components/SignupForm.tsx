import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Import necessary components from Material UI
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

// Import styles
import FormStyles from "../styles/FormStyles";

import clsx from "clsx";
import { IServerResponse, ServerResponseType, IUserData } from "../types";
import { isAlphaNumeric, hasAlphaNumeric, isValidEmail } from "../scripts/DataValidation";

import Popup from "./Popup";

const SignupForm = (): JSX.Element => {
    const textboxStyles: React.CSSProperties = {
        paddingBottom: 15
    }
    const history = useHistory();
    const formClasses = FormStyles();

    const [userData, setUserData] = useState<IUserData>({
        username: "",
        email: "",
        password: "",
    });

    const [emptyUsernameWarning, setEmptyUsernameWarning] = useState<boolean>(false);
    const [emptyEmailWarning, setEmptyEmailWarning] = useState<boolean>(false);
    const [emptyPasswordWarning, setEmptyPasswordWarning] = useState<boolean>(false)

    const ToggleEmptyValueWarning = (e: React.FocusEvent | React.ChangeEvent) => {
        // If all warnings are toggled, do not do anything
        if (emptyUsernameWarning && emptyPasswordWarning && emptyEmailWarning) return;

        const elementID: string = (e.target as HTMLElement).id;

        if (!emptyUsernameWarning && elementID === "username") setEmptyUsernameWarning(true);
        if (!emptyEmailWarning && elementID === "email") setEmptyEmailWarning(true);
        if (!emptyPasswordWarning && elementID === "password") setEmptyPasswordWarning(true);
    }

    const [serverResponse, setServerResponse] = useState<IServerResponse>({})// This stores the latest server response
    const [requestInProcess, setRequestInProcess] = useState<boolean>(false);

    const RegisterUser = async () => {
        // This method registers the user on the server and sets the server response for display
        setRequestInProcess(true);

        if (userData.username.trim() === "" || userData.email.trim() === "" || userData.password.trim() === "" ||
            usernameError !== "" || emailError !== "" || passwordError !== "") {
            // If there is an error with any of the fields or the value of the any of fields is empty or whitespace,
            // toggle all the warnings on and return back

            if (!emptyUsernameWarning) setEmptyUsernameWarning(true);
            if (!emptyEmailWarning) setEmptyEmailWarning(true);
            if (!emptyPasswordWarning) setEmptyPasswordWarning(true);

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

        ToggleEmptyValueWarning(e)

        const newUserData = {
            ...userData,
            [e.target.id]: e.target.value
        }

        setUserData(newUserData)
    }


    const [usernameAvailable, setUsernameAvailable] = useState<boolean>(true);
    const CheckUsernameAvailibility = async (username: string): Promise<boolean> => {
        // This method sends a request to an API by server to check if the current username is available
        try {
            const request = await axios.get(`http://localhost:5000/usernameavailable?username=${username}`);

            if (request.data.data && request.data.data.available !== undefined)
                return request.data.data.available;
            else return false;
        }
        catch (error) {
            console.error("Could not check if the username is available!", error);

            return false;
        }
    }

    useEffect(() => {
        // Everytime the username changes update its availability status
        if (userData.username !== null && userData.username.trim() !== "")
            CheckUsernameAvailibility(userData.username).then(usernameAvail => setUsernameAvailable(usernameAvail));
    }, [userData.username])

    // Everytime username changes, make sure it is valid and available
    const [usernameError, setUsernameError] = useState<string>("");
    useEffect(() => {
        if (userData.username === null) return

        else if (userData.username.length > 50) setUsernameError("Username cannot be longer than 50 characters!")

        else if (emptyUsernameWarning && userData.username.trim() === "") setUsernameError("Username cannot be empty or whitespace!")

        else if (!isAlphaNumeric(userData.username)) setUsernameError("Username must only be alphanumeric!")

        else if (!usernameAvailable) setUsernameError("Username is already taken!")

        else setUsernameError("")

    }, [userData.username, usernameAvailable, emptyUsernameWarning])

    // Everytime email changes, make sure it is valid
    const [emailError, setEmailError] = useState<string>("");
    useEffect(() => {
        if (userData.email === null) return

        else if (emptyEmailWarning && userData.email.trim() === "") setEmailError("Email cannot be empty or whitespace!")

        else if (emptyEmailWarning) {

            if (!isValidEmail(userData.email)) setEmailError("Invalid email entered!")

            else setEmailError("")
        }

    }, [userData.email, emptyEmailWarning])

    // Everytime password changes, make sure it is valid
    const [passwordError, setPasswordError] = useState<string>("");
    useEffect(() => {
        if (userData.password === null) return

        else if (emptyPasswordWarning && userData.password.trim() === "") setPasswordError("Password cannot be empty or whitespace!")

        else if (emptyPasswordWarning) {

            if (userData.password.length < 8) setPasswordError("Password must be at least 8 characters long!")

            else if (userData.password.length > 50) setPasswordError("Password must not be longer than 50 characters!")

            else if (!hasAlphaNumeric(userData.password)) setPasswordError("Password must contain alphanumeric characters!")

            else setPasswordError("")
        }

    }, [userData.password, emptyPasswordWarning])

    const RedirectToSignInPage = () => {
        history.push("/signin")
    }


    return (
        <form className={formClasses.form}>
            <Typography variant="h4" component="h1" className={formClasses.heading} color="textPrimary">Create your Account</Typography>

            <TextField
                variant="outlined"
                required label="Username"
                type="text"
                id="username"
                onChange={HandleInput}
                onBlur={ToggleEmptyValueWarning}
                error={usernameError !== ""}
                helperText={usernameError}
                value={userData.username}
                style={textboxStyles}
            />

            <TextField
                variant="outlined"
                required
                label="Email"
                type="email"
                id="email"
                onChange={HandleInput}
                onBlur={ToggleEmptyValueWarning}
                error={emailError !== ""}
                helperText={emailError}
                value={userData.email}
                style={textboxStyles}
            />

            <TextField
                variant="outlined"
                required
                label="Password"
                type="password"
                id="password"
                onChange={HandleInput}
                onBlur={ToggleEmptyValueWarning}
                error={passwordError !== ""}
                helperText={passwordError}
                value={userData.password}
                style={textboxStyles}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={RegisterUser}
                className={formClasses.button}
                disabled={requestInProcess}
            >
                Sign Up
                {requestInProcess &&
                    <CircularProgress
                        size={24}
                        className={formClasses.progressBar}
                    />
                }
            </Button>

            {
                serverResponse.body === undefined ||
                <Popup borderRadius={10} serverResponse={serverResponse} setServerResponse={setServerResponse} />
            }

            <Typography variant="body1" onClick={RedirectToSignInPage} className={clsx({
                [formClasses.helperText]: true,
                [formClasses.pointerChange]: true,
            })
            }>Already have an account? Click here to sign in</Typography>


        </form>
    );
}

export default SignupForm;