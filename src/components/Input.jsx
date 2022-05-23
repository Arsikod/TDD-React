import React from "react";

export default function Input(props) {
  const { id, label, onChange, help, type = "text", initialValue } = props;

  let inputClass = "form-control";
  if (help) {
    inputClass += " is-invalid";
  }

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        type={type}
        className={inputClass}
        id={id}
        name={id}
        onChange={onChange}
        defaultValue={initialValue}
      />
      {help && <span className="invalid-feedback">{help}</span>}
    </div>
  );
}
