import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadUsers } from "../api/apiCalls";
import Spinner from "./Spinner";
import UserListItem from "./UserListItem";

export default function UserList() {
  const { t } = useTranslation();

  const [page, setPage] = useState({
    content: [],
    page: 0,
    size: 0,
    totalPages: 0,
  });

  const [apiStatus, setApiStatus] = useState("isIdle");

  async function loadData(pageIndex) {
    setApiStatus("isPending");
    try {
      const response = await loadUsers(pageIndex);
      setPage(response.data);
    } catch (error) {
    } finally {
      setApiStatus("isIdle");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="card">
      <div className="card-header text-center">
        <h3>{t("users")}</h3>
      </div>
      <div></div>
      <ul className="list-group list-group-flush">
        {page.content.map((user) => (
          <UserListItem user={user} key={user.id} />
        ))}
      </ul>

      {apiStatus === "isPending" ? (
        <Spinner />
      ) : (
        <div className="card-footer">
          {page.page !== 0 && apiStatus !== "isPending" && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => loadData(page.page - 1)}
            >
              {t("previousPage")}
            </button>
          )}
          {page.totalPages > page.page + 1 && apiStatus !== "isPending" && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => loadData(page.page + 1)}
            >
              {t("nextPage")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
