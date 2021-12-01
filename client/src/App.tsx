import { useState, useEffect } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

// Import necessary components
import SignupForm from "./components/SignupForm";
import SigninForm from "./components/SigninForm";
import VerifyLogin from "./components/VerifyLogin";

const App = (): JSX.Element => {
    const history = useHistory();

    const [username, setUsername] = useState<string>("");

    const [token, setToken] = useState<string>("");
    const [mailedToken, setMailedToken] = useState<boolean>(false);
    const [tokenExpired, setTokenExpired] = useState<boolean>(false);

    useEffect(() => {
        // Whenever the state regarding token changes, we need to redirect the user to its appropriate place
        if (token !== "") history.push("/")

        else if (mailedToken === false) history.push("/signin")

        else if (tokenExpired) {
            setMailedToken(false);
            setTokenExpired(false);
        }

        else if (mailedToken) {
            history.push("/verify")
        }

    }, [token, mailedToken, tokenExpired, history])


    return (
        <Switch>
            <Route path="/signin" exact>
                <SigninForm
                    setUsername={setUsername}
                    setMailedToken={setMailedToken}
                />
            </Route>

            <Route path="/signup" exact>
                <SignupForm />
            </Route>

            <Route path="/verify" exact>
                <VerifyLogin
                    username={username}
                    setToken={setToken}
                />
            </Route>
        </Switch>
    );
}

export default App;