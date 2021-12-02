import { useRef } from "react";
import { IServerResponse } from "../types";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { ServerResponseType } from "../types";

// Icons according to ServerResponseType
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from '@material-ui/icons/Cancel';
import WarningIcon from '@material-ui/icons/Warning';

interface Props {
    borderRadius: number;
    serverResponse: IServerResponse;
    setServerRespose: React.Dispatch<React.SetStateAction<IServerResponse>>;
}

const Popup = (props: Props): JSX.Element => {
    const mainColor = props.serverResponse.type === ServerResponseType.Successful ? "#00963f" : props.serverResponse.type === ServerResponseType.Error ? "#e21e2c" : "#eeb001";

    const popupDiv = useRef<HTMLDivElement>(null);

    const togglePopupOpacity = () => {
        if (popupDiv !== null && popupDiv.current !== null) {
            if (popupDiv.current.style.opacity === "1")
                popupDiv.current.style.opacity = "0";
            else
                popupDiv.current.style.opacity = "1";
        }
        else {
            console.error("popupDiv is null!")
        }
    }

    setTimeout(() => togglePopupOpacity())

    return (
        <div style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            zIndex: 3,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: props.borderRadius,

        }}>

            <div ref={popupDiv} style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",

                width: "80%",
                // boxShadow: "lightgrey 0px 0px 20px 0px",
                backgroundColor: "white",
                padding: "20px 10px",
                borderRadius: 10,
                opacity: 0,
                transition: "opacity 0.5s ease-in-out",
            }}>
                {
                    props.serverResponse.type === ServerResponseType.Successful ?
                        <CheckCircleIcon htmlColor={mainColor} style={{ fontSize: 100, }} /> :
                        props.serverResponse.type === ServerResponseType.Error ?
                            <CancelIcon htmlColor={mainColor} style={{ fontSize: 100, }} /> :
                            <WarningIcon htmlColor={mainColor} style={{ fontSize: 100, }} />

                }
                <Typography style={{ color: mainColor, paddingTop: 10, paddingBottom: 20 }}>{props.serverResponse.body}</Typography>
                <Button
                    style={{
                        backgroundColor: mainColor,
                        color: "white",
                        minWidth: "25%"
                    }}
                    onClick={() => {
                        togglePopupOpacity()
                        setTimeout(() => props.setServerRespose({}), 500)
                    }}
                >OK</Button>
            </div>
        </div>
    );
}

export default Popup;