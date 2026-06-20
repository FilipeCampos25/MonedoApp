import type { Account, AccountOption, CurrentUser } from "../../types/api";
import { apiRequest } from "./client";
import { API_ROUTES } from "./routes";

type OptionKind = "categories" | "subjects";

export function getAccount(token: string) {
  return apiRequest<Account>(API_ROUTES.account, { token });
}

export function updateProfile(
  token: string,
  username: string,
  email: string,
) {
  return apiRequest<CurrentUser>(`${API_ROUTES.account}/profile`, {
    method: "PATCH",
    token,
    body: { username, email },
  });
}

export function deleteAccount(token: string, password: string) {
  return apiRequest<void>(API_ROUTES.account, {
    method: "DELETE",
    token,
    body: { password },
  });
}

export function createAccountOption(
  token: string,
  kind: OptionKind,
  name: string,
) {
  return apiRequest<AccountOption>(`${API_ROUTES.account}/${kind}`, {
    method: "POST",
    token,
    body: { name },
  });
}

export function updateAccountOption(
  token: string,
  kind: OptionKind,
  optionId: number,
  name: string,
) {
  return apiRequest<AccountOption>(
    `${API_ROUTES.account}/${kind}/${optionId}`,
    { method: "PATCH", token, body: { name } },
  );
}

export function deleteAccountOption(
  token: string,
  kind: OptionKind,
  optionId: number,
) {
  return apiRequest<void>(`${API_ROUTES.account}/${kind}/${optionId}`, {
    method: "DELETE",
    token,
  });
}
