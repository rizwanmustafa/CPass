import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router } from "react-router-dom";
import "dotenv/config";

import App from "./App";

import "./styles/styles.css";

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <App />
        </Router>
    </React.StrictMode>
    ,
    document.querySelector("#root")
)
