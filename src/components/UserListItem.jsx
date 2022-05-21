import React from "react";
import { Link } from "react-router-dom";

import defaultProfileImg from "../assets/profile.png";

export default function UserListItem({ user }) {
  return (
    <Link to={`/user/${user.id}`}>
      <li className="list-group-item list-group-item-action">
        <img
          src={defaultProfileImg}
          alt="profile img"
          width="30"
          className="rounded-circle shadow-sm"
        />
        {user.username}
      </li>
    </Link>
  );
}
