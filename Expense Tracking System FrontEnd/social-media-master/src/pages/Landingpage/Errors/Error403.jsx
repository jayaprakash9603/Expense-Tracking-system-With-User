import React from "react";
import ErrorPage from "../../../components/errors/ErrorPage";
import { useNavigate } from "react-router-dom";

export default function Error403({ message }) {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code={403}
      title="Access denied"
      message={
        message ||
        "You do not have permission to view this resource. If you believe this is an error, contact support or try a different account."
      }
      showPath={false}
      primaryAction={{
        label: "Go Home",
        onClick: () => navigate("/", { replace: true }),
      }}
      secondaryAction={{
        label: "Previous Page",
        onClick: () => navigate(-1),
      }}
      widthOffset={320}
    />
  );
}
