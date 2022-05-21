import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Input from "../components/Input";
import { signUp } from "../api/apiCalls";
import Alert from "../components/Alert";
import ButtonWithProgress from "../components/ButtonWithProgress";

export default function SignupPage() {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [isDisabled, setIsDisabled] = useState(true);

  const [signUpInput, setSignUpInput] = useState({
    username: "",
    email: "",
    password: "",
    passwordRepeat: "",
  });

  const [apiStatus, setApiStatus] = useState("isIdle");

  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { password, passwordRepeat } = signUpInput;

  function onSignUpInputChange(e) {
    setSignUpInput({
      ...signUpInput,
      [e.target.name]: e.target.value,
    });

    setValidationErrors({
      ...validationErrors,
      [e.target.name]: "",
    });
  }

  useEffect(() => {
    if (!passwordRepeat || !password) return;

    if (password !== passwordRepeat) {
      setValidationErrors((validationErrors) => ({
        ...validationErrors,
        passwordRepeat: t("passwordMissmatchValidation"),
      }));
    } else {
      setIsDisabled(false);
      setValidationErrors((validationErrors) => ({
        ...validationErrors,
        passwordRepeat: "",
      }));
    }
  }, [password, passwordRepeat, language, t]);

  async function onSubmit(e) {
    e.preventDefault();
    const { username, email, password } = signUpInput;

    setApiStatus("isPending");

    try {
      await signUp({
        username,
        email,
        password,
      });

      setApiStatus("isSuccess");
    } catch (error) {
      if (error.response.status === 400) {
        setValidationErrors(error.response.data.validationErrors);
      }
      setApiStatus("isError");
    }
  }

  return (
    <div
      className=" col-lg-6 offset-lg-3 col-md-8 offset-md-2"
      data-testid="signup-page"
    >
      {apiStatus === "isSuccess" ? (
        <Alert>Please check your email to activate your account</Alert>
      ) : (
        <form className="card" data-testid="form-sign-up">
          <div className="card-header">
            <h1 className="text-center">{t("signUp")}</h1>
          </div>

          <div className="card-body">
            <Input
              id="username"
              label={t("username")}
              onChange={onSignUpInputChange}
              help={validationErrors.username}
            />

            <Input
              label={t("email")}
              id="email"
              name="email"
              onChange={onSignUpInputChange}
              help={validationErrors.email}
            />

            <Input
              type="password"
              label={t("password")}
              id="password"
              name="password"
              onChange={onSignUpInputChange}
              help={validationErrors.password}
            />

            <Input
              type="password"
              label={t("passwordRepeat")}
              id="passwordRepeat"
              name="passwordRepeat"
              onChange={onSignUpInputChange}
              help={validationErrors.passwordRepeat}
            />

            <div className="text-center">
              <ButtonWithProgress
                apiStatus={apiStatus}
                disabled={isDisabled || apiStatus === "isPending"}
                onClick={onSubmit}
              >
                {t("signUp")}
              </ButtonWithProgress>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
