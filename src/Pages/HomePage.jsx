import React from "react";
import UserList from "../components/UserList";

export default function HomePage() {
  return (
    <div data-testid="home-page">
      <UserList />
    </div>
  );
}
