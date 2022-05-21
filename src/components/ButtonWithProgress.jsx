import React from "react";
import Spinner from "./Spinner";

export default function ButtonWithProgress({
  disabled,
  apiStatus,
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
