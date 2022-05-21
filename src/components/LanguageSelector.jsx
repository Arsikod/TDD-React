import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import useHover from "../hooks/useHover";

export default function LanguageSelector({}) {
  const {
    i18n: { changeLanguage },
  } = useTranslation();

  const ref = useRef();
  const on = useHover(ref.current);

  let backgroundColor = "white";
  if (on) {
    backgroundColor = "pink";
  }

  return (
    <div ref={ref} style={{ backgroundColor }}>
      <span title="Turkish" onClick={() => changeLanguage("tr")}>
        TR 🇹🇷
      </span>
      <span title="English" onClick={() => changeLanguage("en")}>
        EN 🇺🇸
      </span>
    </div>
  );
}
