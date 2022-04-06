import React, { useState } from "react";
import axios from "axios";

// Import interfaces
import { IServerResponse } from "../../types";

// Import necessary styles
import FormStyles from "../../styles/FormStyles";

// Import necessary components from material ui
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Popup from "../Popup";

interface Props {
  username: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}

const VerifyLogin = (props: Props): JSX.Element => {
  const formClasses = FormStyles();

  const [token, setToken] = useState<string>("");
  const [requestInProcess, setRequestInProcess] = useState<boolean>(false);
  const [serverResponse, setServerResponse] = useState<IServerResponse>({ message: "" });
  const [serverResponseStatus, setServerResponseStatus] = useState<number>(-1);

  const VerifyToken = async () => {
    setRequestInProcess(true);

    try {
      const request = await axios.post("http://localhost:5000/auth/verify/", {
        token: token
      });

      const response = await request.data as IServerResponse;

      if (request.status === 200)
        props.setToken(token);
      else {
        setServerResponseStatus(request.status);
        setServerResponse(response);
      }
    }
    catch (e) {
      console.error("Could not verify token!", e);
      setServerResponse({ message: "Could not connect to server!", });
    }

    setRequestInProcess(false);

  };

  return (
    <form className={formClasses.form}>
      <Typography variant="h4" component="h1" className={formClasses.heading} color="textPrimary">Making sure it&apos;s You</Typography>

      <Typography component="p" className={formClasses.helperText} color="textPrimary">
        Please enter the verification token mailed to you.
      </Typography>

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
        (serverResponse.message ?? "") === "" ||
        <Popup
          borderRadius={10}
          serverResponse={serverResponse}
          serverResponseStatus={serverResponseStatus}
          setServerResponse={setServerResponse}
        />
      }

    </form>
  );
};

export default VerifyLogin;