import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { logIn } from "../api/apiCalls";
import Alert from "../components/Alert";
import ButtonWithProgress from "../components/ButtonWithProgress";
import Input from "../components/Input";

export default function LoginPage({ setAuth }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [apiStatus, setApiStatus] = useState("isIdle");

  const [logInInput, setSignUpInput] = useState({
    email: "",
    password: "",
  });

  const [validationError, setValidationError] = useState("");

  function onLoginInputChange(e) {
    setApiStatus("isIdle");

    setSignUpInput({
      ...logInInput,
      [e.target.name]: e.target.value,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    setApiStatus("isPending");

    try {
      const response = await logIn(logInInput);

      setApiStatus("isSuccess");
      navigate("/");
      setAuth({ isLoggedIn: true, id: response.data.id });
    } catch (error) {
      setApiStatus("isError");
      setValidationError(error.response?.data.message);
    }
  }

  return (
    <div
      className=" col-lg-6 offset-lg-3 col-md-8 offset-md-2"
      data-testid="login-page"
    >
      <form className="card">
        <div className="card-header">
          <h1 className="text-center">{t("login")}</h1>
        </div>

        <div className="card-body">
          <Input
            label={t("email")}
            id="email"
            name="email"
            onChange={onLoginInputChange}
          />

          <Input
            label={t("password")}
            type="password"
            id="password"
            name="password"
            onChange={onLoginInputChange}
          />

          {apiStatus === "isError" && (
            <Alert type="danger">{validationError}</Alert>
          )}

          <div className="text-center">
            <ButtonWithProgress
              onClick={onSubmit}
              apiStatus={apiStatus}
              disabled={
                (!logInInput.email && !logInInput.password) ||
                apiStatus === "isPending"
              }
            >
              {t("login")}
            </ButtonWithProgress>
          </div>
        </div>
      </form>
    </div>
  );
}
