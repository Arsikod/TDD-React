import React from "react";

export default function Spinner(props) {
  let spanClass = "spinner-border";
  if (props.size !== "big") {
    spanClass += " spinner-border-sm";
  }

  return <span className={spanClass} role="status" aria-hidden="true"></span>;
}
