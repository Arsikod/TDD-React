import React from "react";
import defaultProfileImg from "../assets/profile.png";
import { useAuthContext } from "../context/AuthContextProvider";

export default function ProfileCard({ user }) {
  const { auth } = useAuthContext();

  return (
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

      <div className="card-body">
        <h3>{user?.username}</h3>
      </div>

      {user?.id === auth?.id && <button>Edit</button>}
    </div>
  );
}
