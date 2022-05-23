import React from "react";
import Spinner from "./Spinner";

export default function ButtonWithProgress({
  apiStatus,
  disabled = apiStatus === "isPending",
  onClick,
  children,
}) {
  return (
    <button onClick={onClick} className="btn btn-primary" disabled={disabled}>
      {apiStatus === "isPending" && <Spinner />}
      {children}
    </button>
  );
}
