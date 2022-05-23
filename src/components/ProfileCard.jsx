import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUser, updateUser } from "../api/apiCalls";
import defaultProfileImg from "../assets/profile.png";
import { useAuthContext } from "../context/AuthContextProvider";
import ButtonWithProgress from "./ButtonWithProgress";
import Input from "./Input";
import Modal from "./Modal";

export default function ProfileCard({ user }) {
  const { auth, setAuth } = useAuthContext();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [apiStatus, setApiStatus] = useState("isIdle");
  const [newUserName, setNewUserName] = useState(user?.username);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteApiStatus, setDeleteApiStatus] = useState("isIdle");

  async function onSaveClick() {
    setApiStatus("isPending");
    try {
      await updateUser(auth.id, { username: newUserName }, auth.header);
      setIsEditMode(false);
      setAuth({ ...auth, username: newUserName });
    } catch (err) {
      setApiStatus("isError");
    } finally {
      setApiStatus("isIdle");
    }
  }

  function onClickCancel() {
    setIsEditMode(false);
    setNewUserName(auth.username);
  }

  async function onClickDelete() {
    setDeleteApiStatus("isPending");

    try {
      await deleteUser(user.id);
      navigate("/");
    } catch (error) {
    } finally {
      setDeleteApiStatus("isIdle");
    }
  }

  return (
    <>
      <div className="card text-center">
        <div className="card-header">
          <img
            src={defaultProfileImg}
            alt="profile img"
            width="200"
            height="200"
            className="rounded-circle shadow"
          />
        </div>

        {!isEditMode && (
          <div className="card-body">
            <h3>{newUserName}</h3>
          </div>
        )}

        {user?.id === auth?.id && !isEditMode && (
          <>
            <button
              className="btn btn-outline-success"
              onClick={() => setIsEditMode(true)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger mt-2"
              onClick={() => setModalVisible(true)}
            >
              Delete my account
            </button>
          </>
        )}
        {isEditMode && (
          <>
            <Input
              label="Change your username"
              id="username"
              initialValue={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <ButtonWithProgress onClick={onSaveClick} apiStatus={apiStatus}>
              Save
            </ButtonWithProgress>
            <button
              className="btn btn-outline-secondary"
              onClick={onClickCancel}
            >
              Cancel
            </button>
          </>
        )}
      </div>
      {modalVisible && (
        <Modal
          content="Are you sure you want to delete your account?"
          onClickCancel={() => setModalVisible(false)}
          onClickConfirm={() => onClickDelete()}
          apiProgress={deleteApiStatus}
        />
      )}
    </>
  );
}
