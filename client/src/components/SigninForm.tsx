import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Import interfaces
import { IUserData, IServerResponse, ServerResponseType } from "../types";
// Import styles
import FormStyles from "../styles/FormStyles";

// Import clsx for conditional rendering
import clsx from "clsx";

// Import necessary components from Material UI
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

import Popup from "./Popup";

interface Props {
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setMailedToken: React.Dispatch<React.SetStateAction<boolean>>;
}

const SigninForm = (props: Props): JSX.Element => {
    const textboxStyles: React.CSSProperties = {
        paddingBottom: 15
    }

    const formClasses = FormStyles();
    const history = useHistory();

    const [userData, setUserData] = useState<IUserData>({
        username: "",
        password: "",
        email: "",
    });

    const [emptyUsernameWarning, setEmptyUsernameWarning] = useState<boolean>(false);
    const [emptyPasswordWarning, setEmptyPasswordWarning] = useState<boolean>(false);

    const [serverResponse, setServerResponse] = useState<IServerResponse>({});
    const [requestInProcess, setRequestInProcess] = useState<boolean>(false);

    const SigninUser = async () => {
        setRequestInProcess(true);
        // If the user has not input credentials, toggle warnings and return
        if (userData.username.trim() === "" || userData.password.trim() === "") {
            // Show the warnings if input is empty
            if (!emptyUsernameWarning) setEmptyUsernameWarning(true);
            if (!emptyPasswordWarning) setEmptyPasswordWarning(true);

            setRequestInProcess(false);
            return;
        }

        try {
            // Change this later
            const request = await axios.post("http://localhost:5000/auth/generate/", {
                username: userData.username,
                password: userData.password,
            })

            const response = await request.data;

            if (response.type === ServerResponseType.Successful) {
                props.setUsername(userData.username);
                props.setMailedToken(true);
            }
            else setServerResponse(response)
        }
        catch (e) {
            console.error("Could not sign in user!", e)
            setServerResponse({ type: ServerResponseType.Error, body: "Could not connect to server!", })
        }

        setRequestInProcess(false);
    }

    const HandleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        // This method deals with changes in the value of Input Elements for forms

        const newUserData = {
            ...userData,
            [e.target.id]: e.target.value
        }

        setUserData(newUserData)
    }

    const ToggleEmptyValueWarning = (e: React.FocusEvent<HTMLInputElement>) => {
        // If both warning are already toggled, do not do anything
        if (emptyPasswordWarning && emptyUsernameWarning) return;

        const elementID: string = (e.target as HTMLInputElement).id

        if (!emptyUsernameWarning && elementID === "username") setEmptyUsernameWarning(true);
        else if (!emptyPasswordWarning && elementID === "password") setEmptyPasswordWarning(true);
    }

    const RedirectToSignUpPage = () => {
        history.push("/signup");
    }

    return (
        <form className={formClasses.form}>
            <Typography variant="h4" component="h1" className={formClasses.heading} color="textPrimary">Sign in to your Account</Typography>

            <TextField
                variant="outlined"
                required
                label="Username"
                type="text"
                id="username"
                onChange={HandleInput}
                onBlur={ToggleEmptyValueWarning}
                error={emptyUsernameWarning && userData.username.trim() === ""}
                helperText={emptyUsernameWarning && userData.username.trim() === "" && "Username cannot be empty or whitespace!"}
                value={userData.username}
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
                error={emptyPasswordWarning && userData.password.trim() === ""}
                helperText={emptyPasswordWarning && userData.password.trim() === "" && "Password cannot be empty or whitespace!"}
                value={userData.password}
                style={textboxStyles}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={SigninUser}
                className={formClasses.button}
                disabled={requestInProcess}
            >
                Sign In
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

            <Typography variant="body1" onClick={RedirectToSignUpPage} className={clsx({
                [formClasses.helperText]: true,
                [formClasses.pointerChange]: true,
            })
            }>Do not have an account? Click here to create one</Typography>

        </form>
    );
}

export default SigninForm;