import React, { useState } from "react";
import axios from "axios";
import clsx from "clsx";

// Import interfaces
import { IServerResponse, ITokenStatus, ServerResponseType } from "../types";

// Import necessary styles
import FormStyles from "../styles/FormStyles";

// Import necessary components from material ui
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

interface Props {
    username: string;
    token: string;
    tokenStatus: ITokenStatus;
    setTokenStatus: React.Dispatch<React.SetStateAction<ITokenStatus>>;
}

const VerifyLogin = (props: Props): JSX.Element => {
    const formClasses = FormStyles();

    const [verificationCode, setVerificationCode] = useState<string>("");
    const [wrongCode, setWrongCode] = useState<boolean>(false);

    const [requestInProcess, setRequestInProcess] = useState<boolean>(false);
    const [serverResponse, setServerResponse] = useState<IServerResponse>({});
    const VerifyToken = async () => {
        setRequestInProcess(true);
        if (verificationCode.trim() === "") {
            setServerResponse({
                type: 2,
                body: "Verification code cannot be empty or whitespace!"
            })
            setRequestInProcess(false);
            return
        }

        try {
            // First verify, then update the token status
            const verificationRequest = await axios.post("http://localhost:5000/tokens/", {
                mode: 'activate',
                username: props.username,
                token: props.token,
                activation_code: verificationCode,
            });

            const response = verificationRequest.data;

            if (response.type === ServerResponseType.Error) {
                // Update the status of token by running another fetch
                const tokenStatus = await axios.post("http://localhost:5000/tokens/", {
                    mode: 'status',
                    username: props.username,
                    token: props.token
                })

                const tokenResponse = tokenStatus.data;

                setServerResponse(response);
                props.setTokenStatus(tokenResponse.data);
            }
            else props.setTokenStatus(response.data);

        }
        catch (e) {
            console.error("Could not verify user!", e)
        }
        finally {
            setRequestInProcess(false)
        }
    }


    return (
        <form className={formClasses.form}>
            <Typography variant="h4" component="h1" className={formClasses.heading} color="textPrimary">Making sure it's You</Typography>

            <Typography component="p" className={formClasses.helperText} color="textPrimary">Please enter the verification code sent on your email address.</Typography>

            <br />

            <TextField
                variant="outlined"
                required
                label="Verification Code"
                type="text"
                id="verificationCode"
                onChange={e => setVerificationCode(e.target.value)}
                error={wrongCode}
                helperText={wrongCode && "Please input the correct verification code!"}
                value={verificationCode}
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
                <Typography variant="body1" className={clsx({
                    [formClasses.helperText]: true,
                    [formClasses.successful]: serverResponse.type === ServerResponseType.Successful,
                    [formClasses.error]: serverResponse.type === ServerResponseType.Error,
                    [formClasses.warning]: serverResponse.type === ServerResponseType.Warning
                })}>
                    {serverResponse.body}
                </Typography>
            }

        </form>
    );
}

export default VerifyLogin;