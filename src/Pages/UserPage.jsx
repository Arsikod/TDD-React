import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getUserById } from "../api/apiCalls";
import Alert from "../components/Alert";
import ProfileCard from "../components/ProfileCard";
import Spinner from "../components/Spinner";

export default function UserPage() {
  const [user, setUser] = useState();
  const [apiStatus, setApiStatus] = useState("isIdle");
  const [errorMsg, setError] = useState("");
  const { id } = useParams();

  useEffect(() => {
    async function getUser() {
      setApiStatus("isPending");
      try {
        const response = await getUserById(id);
        setUser(response.data);
      } catch (error) {
        setError(error.response.data.message);
      } finally {
        setApiStatus("isIdle");
      }
    }

    getUser();
  }, [id]);

  if (errorMsg) {
    return <Alert type="danger">{errorMsg}</Alert>;
  }

  return (
    <div data-testid="user-page">
      {apiStatus === "isPending" ? (
        <Alert type="secondary" center>
          <Spinner size="big" />
        </Alert>
      ) : (
        <ProfileCard user={user} />
      )}
    </div>
  );
}
