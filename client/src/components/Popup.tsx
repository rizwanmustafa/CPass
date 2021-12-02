import { IServerResponse } from "../types";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

interface Props {
    borderRadius: number;
    serverResponse: IServerResponse;
    setServerRespose: React.Dispatch<React.SetStateAction<IServerResponse>>;
}

const Popup = (props: Props): JSX.Element => {
    const successColor = "#00963f";

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

            <div style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",

                width: "80%",
                // boxShadow: "lightgrey 0px 0px 20px 0px",
                backgroundColor: "white",
                padding: "20px 10px",
                borderRadius: 10,
            }}>
                <CheckCircleIcon htmlColor={successColor} style={{ fontSize: 100, }} />
                <Typography style={{ color: successColor, paddingTop: 10, paddingBottom: 20 }}>{props.serverResponse.body}</Typography>
                <Button
                    style={{
                        backgroundColor: successColor,
                        color: "white",
                        minWidth: "25%"
                    }}
                    onClick={() => props.setServerRespose({})}
                >OK</Button>
            </div>
        </div>
    );
}

export default Popup;