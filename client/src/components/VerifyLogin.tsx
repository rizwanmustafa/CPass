import React, { useState } from "react";
import axios from "axios";
import clsx from "clsx";

// Import interfaces
import { IServerResponse, ServerResponseType } from "../types";

// Import necessary styles
import FormStyles from "../styles/FormStyles";

// Import necessary components from material ui
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Popup from "./Popup";

interface Props {
    username: string;
    setToken: React.Dispatch<React.SetStateAction<string>>;
}

const VerifyLogin = (props: Props): JSX.Element => {
    const formClasses = FormStyles();

    const [token, setToken] = useState<string>("");
    const [requestInProcess, setRequestInProcess] = useState<boolean>(false);
    const [serverResponse, setServerResponse] = useState<IServerResponse>({});

    const VerifyToken = async () => {
        setRequestInProcess(true);

        const request = await axios.post("http://localhost:5000/auth/verify/", {
            token: token
        })

        const response = await request.data;

        if (response.type === ServerResponseType.Error) setServerResponse(response)
        else if (response.type === ServerResponseType.Successful) {
            props.setToken(token)
        }

        setRequestInProcess(false);

    }

    return (
        <form className={formClasses.form}>
            <Typography variant="h4" component="h1" className={formClasses.heading} color="textPrimary">Making sure it's You</Typography>

            <Typography component="p" className={formClasses.helperText} color="textPrimary">Please enter the verification code sent on your email address.</Typography>

            <br />

            <TextField
                variant="outlined"
                required
                label="Token"
                type="text"
                id="token"
                onChange={e => setToken(e.target.value)}
                value={token}
                autoComplete="off"
            />


            <br />
            <Button
                variant="contained"
                color="primary"
                onClick={VerifyToken}
                className={formClasses.button}
                disabled={requestInProcess}
            >
                Verify
                {requestInProcess &&
                    <CircularProgress
                        size={24}
                        className={formClasses.progressBar}
                    />
                }
            </Button>

            {
                serverResponse.body === undefined ||
                <Popup borderRadius={10} serverResponse={serverResponse} setServerRespose={setServerResponse} />
            }

        </form>
    );
}

export default VerifyLogin;