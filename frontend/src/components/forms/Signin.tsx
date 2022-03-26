import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Import interfaces
import { IUserData, IServerResponse } from "../../types";
// Import styles
import FormStyles from "../../styles/FormStyles";

// Import clsx for conditional rendering
import clsx from "clsx";

// Import necessary components from Material UI
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

import Popup from "../Popup";

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

    const [serverResponse, setServerResponse] = useState<IServerResponse>({ message: "" });
    const [serverResponseStatus, setServerResponseStatus] = useState<number>(-1);
    const [requestInProcess, setRequestInProcess] = useState<boolean>(false);

    const signIn = async () => {
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

            const response = await request.data as IServerResponse;

            if (request.status === 200) {
                props.setUsername(userData.username);
                props.setMailedToken(true);
            }
            else
            {
                setServerResponseStatus(request.status);
                setServerResponse(response)
            }
        }
        catch (e) {
            console.log(e.response.data.message);
            setServerResponseStatus(e.response.status);
            setServerResponse({ message: e.response.data.message });
        }

        setRequestInProcess(false);
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUserData = {
            ...userData,
            [e.target.id]: e.target.value
        }
        setUserData(newUserData)
    };

    const toggleEmptyWarning = (e: React.FocusEvent<HTMLInputElement>) => {
        if (emptyPasswordWarning && emptyUsernameWarning) return;

        const elementID: string = (e.target as HTMLInputElement).id

        if (elementID === "username" && !emptyUsernameWarning) setEmptyUsernameWarning(true);
        else if (elementID === "password" && !emptyPasswordWarning) setEmptyPasswordWarning(true);
    }

    const redirectToSignUpPage = () => history.push("/signup");

    return (
        <form className={formClasses.form}>
            <Typography variant="h4" component="h1" className={formClasses.heading} color="textPrimary">Sign in</Typography>

            <TextField
                variant="outlined"
                required
                label="Username"
                type="text"
                id="username"
                onChange={handleInput}
                onBlur={toggleEmptyWarning}
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
                onChange={handleInput}
                onBlur={toggleEmptyWarning}
                error={emptyPasswordWarning && userData.password.trim() === ""}
                helperText={emptyPasswordWarning && userData.password.trim() === "" && "Password cannot be empty or whitespace!"}
                value={userData.password}
                style={textboxStyles}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={signIn}
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
                (serverResponse.message ?? "") === "" ||
                <Popup
                    borderRadius={10}
                    serverResponseStatus={serverResponseStatus}
                    serverResponse={serverResponse}
                    setServerResponse={setServerResponse}
                />
            }

            <Typography variant="body1" onClick={redirectToSignUpPage} className={clsx({
                [formClasses.helperText]: true,
                [formClasses.pointerChange]: true,
            })
            }>Do not have an account? Click here to create one</Typography>

        </form>
    );
}

export default SigninForm;