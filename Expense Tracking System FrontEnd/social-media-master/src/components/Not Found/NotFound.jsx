import React from "react";
import ErrorPage from "../errors/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      code={404}
      title="Page not found"
      message="We looked everywhere but couldn\'t find what you were after."
      showPath
    />
  );
}
