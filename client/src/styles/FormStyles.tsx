import { makeStyles, createStyles, Theme } from "@material-ui/core";

const FormStyles = makeStyles((theme: Theme) => // This stores the classes used for styling the components
    createStyles({
        form: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "50vw",
            maxWidth: "400px",
            boxShadow: "lightgrey 0px 0px 20px 0px",
            padding: 20,
            margin: 20,
            borderRadius: 10,
        },
        heading: {
            textAlign: "center",
            marginBottom: 30,
        },
        button: {
            position: "relative",
            marginBottom: 20,
        },
        progressBar: {
            position: 'absolute',
        },

        helperText: {
            textAlign: "center",
            paddingBottom: "10px",
        },
        error: {
            color: "red",
        },
        successful: {
            color: "green",
        },
        warning: {
            color: "orange",
        },
        pointerChange: {
            cursor: "pointer",
        }
    })
);

export default FormStyles;