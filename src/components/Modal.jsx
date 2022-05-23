import React from "react";
import ButtonWithProgress from "./ButtonWithProgress";

export default function Modal(props) {
  const {
    content,
    cancelButton = "Cancel",
    confirmButton = "Yes",
    onClickCancel,
    onClickConfirm,
    apiProgress = "isIdle",
  } = props;

  return (
    <div
      className="bg-black bg-opacity-50 d-block modal show"
      tabIndex="-1"
      data-testid="modal"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Modal title</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>{content}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClickCancel}
            >
              {cancelButton}
            </button>
            <ButtonWithProgress
              onClick={onClickConfirm}
              apiStatus={apiProgress}
            >
              {confirmButton}
            </ButtonWithProgress>
          </div>
        </div>
      </div>
    </div>
  );
}
