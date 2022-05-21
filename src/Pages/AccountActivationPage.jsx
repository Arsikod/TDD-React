import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { activate } from "../api/apiCalls";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";

export default function AccountActivationPage() {
  const [result, setResult] = useState("");
  let { token } = useParams();

  useEffect(() => {
    async function activateRequest() {
      try {
        setResult("");
        await activate(token);
        setResult("success");
      } catch (error) {
        setResult("fail");
      }
    }

    activateRequest();
  }, [token]);

  let content = (
    <Alert type="secondary" center>
      <Spinner size="big" />
    </Alert>
  );
  if (result === "success") {
    content = <Alert type="success">Account is activated</Alert>;
  } else if (result === "fail") {
    content = <Alert type="danger">Activation failed</Alert>;
  }

  return <div data-testid="activation-page">{content}</div>;
}
