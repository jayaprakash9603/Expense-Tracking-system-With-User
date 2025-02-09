// src/components/ErrorMessage.jsx

const ErrorMessage = ({ error }) => {
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Unknown error occurred.";
  return <p>Error: {errorMessage}</p>;
};

export default ErrorMessage;
