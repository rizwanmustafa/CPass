import React, { useEffect, useRef } from "react";
import { IServerResponse } from "../types";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

// Icons according to ServerResponseType
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";

interface Props {
  borderRadius: number;
  serverResponse: IServerResponse;
  serverResponseStatus: number;
  setServerResponse: React.Dispatch<React.SetStateAction<IServerResponse>>;
}

const Popup = (props: Props): JSX.Element => {
  const mainColor = props.serverResponseStatus === 200 ? "#00963f" : "#e21e2c";

  const popupDiv = useRef<HTMLDivElement>(null);

  const togglePopupOpacity = () => {
    if (popupDiv !== null && popupDiv.current !== null) {
      if (popupDiv.current.style.opacity === "1")
        popupDiv.current.style.opacity = "0";
      else
        popupDiv.current.style.opacity = "1";
    }
    else {
      console.error("popupDiv is null!");
    }
  };

  useEffect(() => {
    setTimeout(() => togglePopupOpacity());
  }, []);

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
          props.serverResponseStatus === 200 ?
            <CheckCircleIcon htmlColor={mainColor} style={{ fontSize: 100, }} /> :
            <CancelIcon htmlColor={mainColor} style={{ fontSize: 100, }} />

        }
        <Typography
          style={{
            color: mainColor,
            paddingTop: 10,
            paddingBottom: 20,
            textAlign: "center"
          }}>
          {props.serverResponse.message}
        </Typography>
        <Button
          style={{
            backgroundColor: mainColor,
            color: "white",
            minWidth: "25%"
          }}
          onClick={() => {
            togglePopupOpacity();
            setTimeout(() => props.setServerResponse({ message: "" }), 500);
          }}
        >OK</Button>
      </div>
    </div>
  );
};

export default Popup;