import { useState, useEffect } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

// Import interfaces
import { ITokenStatus } from "./types";

// Import necessary components
import SignupForm from "./components/SignupForm";
import SigninForm from "./components/SigninForm";
import VerifyLogin from "./components/VerifyLogin";

const App = (): JSX.Element => {
    const history = useHistory();

    const [username, setUsername] = useState<string>("");
    const [userToken, setUserToken] = useState<string>("");
    const [tokenStatus, setTokenStatus] = useState<ITokenStatus>({
        activated: false,
        expired: false,
    })

    useEffect(() => {
        // Whenever the state regarding token changes, we need to redirect the user to its appropriate place
        if (userToken === "") history.push("/signin")

        else if (tokenStatus.expired) {
            setUserToken("");
            setTokenStatus({
                activated: false,
                expired: false,
            })
        }

        else if (!tokenStatus.activated) {
            history.push("/verify")
        }

        else history.push("/")

    }, [userToken, tokenStatus])

    return (
        <Switch>
            <Route path="/signin" exact>
                <SigninForm
                    setUsername={setUsername}
                    setUserToken={setUserToken}
                />
            </Route>

            <Route path="/signup" exact>
                <SignupForm />
            </Route>

            <Route path="/verify" exact>
                <VerifyLogin
                    username={username}
                    token={userToken}
                    tokenStatus={tokenStatus}
                    setTokenStatus={setTokenStatus}
                />
            </Route>
        </Switch>
    );
}

export default App;