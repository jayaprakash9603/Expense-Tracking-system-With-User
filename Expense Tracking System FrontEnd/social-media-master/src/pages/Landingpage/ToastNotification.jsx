import { Snackbar, Alert } from "@mui/material";

const ToastNotification = ({
  open,
  message,
  onClose,
  anchorOrigin,
  severity = "success",
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification;
