import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { scrypt } from "scrypt-js";
import axios from "axios";

// Import necessary components from Material UI
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

// Import styles
import FormStyles from "../../styles/FormStyles";

import clsx from "clsx";
import { IServerResponse, IUserData } from "../../types";
import { isAlphaNumeric, hasAlphaNumeric, isValidEmail } from "../../scripts/DataValidation";

import Popup from "../Popup";

const textboxStyles: React.CSSProperties = { paddingBottom: 15 };

const getAuthKey = async (email: string, password: string): Promise<string> => {
  try {
    const input = Buffer.from((password + email).normalize("NFKC"));
    const salt = Buffer.from("salt");
    const tempKey = await scrypt(input, salt, 65536, 8, 1, 64);
    return Buffer.from(tempKey).toString("base64");
  }
  catch (e) {
    console.error("Could not generate auth key");
    console.error(e);
    return "";
  }
};

interface IFormTextBoxProps {
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleEmptyValWarning: (e: React.FocusEvent) => void;
  label: string;
  error: string;
  value: string;
  type: string;
}

const FormTextBox = (props: IFormTextBoxProps): JSX.Element => {
  return (
    <TextField
      variant="outlined"
      required
      label={props.label}
      type={props.type}
      id={props.label.toLowerCase()}
      onChange={props.handleInput}
      onBlur={props.toggleEmptyValWarning}
      error={props.error !== ""}
      helperText={props.error}
      value={props.value}
      style={textboxStyles}
    />
  );
};


const SignupForm = (): JSX.Element => {
  const history = useHistory();
  const formClasses = FormStyles();

  const [userData, setUserData] = useState<IUserData>({
    username: "",
    email: "",
    password: "",
  });

  const [emptyUsernameWarning, setEmptyUsernameWarning] = useState<boolean>(false);
  const [emptyEmailWarning, setEmptyEmailWarning] = useState<boolean>(false);
  const [emptyPasswordWarning, setEmptyPasswordWarning] = useState<boolean>(false);

  const toggleEmptyValWarning = (e: React.FocusEvent) => {
    // If all warnings are toggled, do not do anything
    if (emptyUsernameWarning && emptyPasswordWarning && emptyEmailWarning) return;

    const elementID: string = (e.target as HTMLElement).id;

    if (!emptyUsernameWarning && elementID === "username") setEmptyUsernameWarning(true);
    if (!emptyEmailWarning && elementID === "email") setEmptyEmailWarning(true);
    if (!emptyPasswordWarning && elementID === "password") setEmptyPasswordWarning(true);
  };

  const [serverResponse, setServerResponse] = useState<IServerResponse>({ message: "" }); // This stores the latest server response
  const [serverResponseStatus, setServerResponseStatus] = useState<number>(-1);
  const [requestInProcess, setRequestInProcess] = useState<boolean>(false);


  const registerUser = async (): Promise<void> => {
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
      const authKey = await getAuthKey(userData.email, userData.password);
      if (authKey === "") throw Error("Could not generate auth key!");
      const fetchData = await axios.post(`${process.env.REACT_APP_API_URL}/users/signup`, {
        username: userData.username,
        email: userData.email,
        authKey,
      });

      const serverMessage = await fetchData.data;
      console.log(fetchData.status);

      setServerResponseStatus(fetchData.status);
      setServerResponse(serverMessage);
    }
    catch (e) {
      if (e.response) {
        setServerResponseStatus(e.response.status);
        setServerResponse({ message: e.response.data.message });
      }
      else console.error(e);
    }
    finally {
      setRequestInProcess(false);
    }
  };


  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This method deals with changes in the value of Input Elements for forms

    const newUserData = {
      ...userData,
      [e.target.id]: e.target.value
    };

    setUserData(newUserData);
  };


  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(true);
  const checkUsernameAvail = async (username: string): Promise<boolean> => {
    // This method sends a request to an API by server to check if the current username is available
    try {
      const request = await axios.get(`${process.env.REACT_APP_API_URL}/users/usernameAvailable?username=${username}`);

      if (request.data && request.data.usernameAvailable !== undefined)
        return request.data.usernameAvailable;

      else return false;
    }
    catch (error) {
      console.error("Could not check if the username is available!", error);

      return true;
    }
  };

  useEffect(() => {
    // Everytime the username changes update its availability status
    if (userData.username !== null && userData.username.trim() !== "")
      checkUsernameAvail(userData.username).then(usernameAvail => setUsernameAvailable(usernameAvail));
  }, [userData.username]);

  // Everytime username changes, make sure it is valid and available
  const [usernameError, setUsernameError] = useState<string>("");
  useEffect(() => {
    if (userData.username === null) return;

    else if (userData.username.length > 50) setUsernameError("Username cannot be longer than 50 characters!");

    else if (emptyUsernameWarning && userData.username.trim() === "") setUsernameError("Username cannot be empty or whitespace!");

    else if (!isAlphaNumeric(userData.username)) setUsernameError("Username must only be alphanumeric!");

    else if (!usernameAvailable) setUsernameError("Username is already taken!");

    else setUsernameError("");

  }, [userData.username, usernameAvailable, emptyUsernameWarning]);

  // Everytime email changes, make sure it is valid
  const [emailError, setEmailError] = useState<string>("");
  useEffect(() => {
    if (userData.email === null) return;

    else if (emptyEmailWarning && userData.email.trim() === "") setEmailError("Email cannot be empty or whitespace!");

    else if (emptyEmailWarning) {

      if (!isValidEmail(userData.email)) setEmailError("Invalid email entered!");

      else setEmailError("");
    }

  }, [userData.email, emptyEmailWarning]);

  // Everytime password changes, make sure it is valid
  const [passwordError, setPasswordError] = useState<string>("");
  useEffect(() => {
    if (userData.password === null) return;

    else if (emptyPasswordWarning && userData.password.trim() === "") setPasswordError("Password cannot be empty or whitespace!");

    else if (emptyPasswordWarning) {

      if (userData.password.length < 8) setPasswordError("Password must be at least 8 characters long!");

      else if (userData.password.length > 50) setPasswordError("Password must not be longer than 50 characters!");

      else if (!hasAlphaNumeric(userData.password)) setPasswordError("Password must contain alphanumeric characters!");

      else setPasswordError("");
    }

  }, [userData.password, emptyPasswordWarning]);

  const RedirectToSignInPage = () => history.push("/signin");


  return (
    <form
      className={formClasses.form}
      onKeyPress={(e) => { if (e.key === "Enter") registerUser(); }}
    >
      <Typography variant="h4" component="h1" className={formClasses.heading} color="textPrimary">Sign up</Typography>

      <FormTextBox
        handleInput={handleInput}
        toggleEmptyValWarning={toggleEmptyValWarning}
        label="Username"
        type="text"
        value={userData.username}
        error={usernameError}
      />

      <FormTextBox
        handleInput={handleInput}
        toggleEmptyValWarning={toggleEmptyValWarning}
        label="Email"
        type="text"
        value={userData.email}
        error={emailError}
      />

      <FormTextBox
        handleInput={handleInput}
        toggleEmptyValWarning={toggleEmptyValWarning}
        label="Password"
        type="password"
        value={userData.password}
        error={passwordError}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={registerUser}
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
        (serverResponse.message ?? "") === "" ||
        <Popup
          borderRadius={10}
          serverResponse={serverResponse}
          serverResponseStatus={serverResponseStatus}
          setServerResponse={setServerResponse}
        />
      }

      <Typography variant="body1" onClick={RedirectToSignInPage} className={clsx({
        [formClasses.helperText]: true,
        [formClasses.pointerChange]: true,
      })
      }>Already have an account? Click here to sign in</Typography>

    </form>
  );
};

export default SignupForm;