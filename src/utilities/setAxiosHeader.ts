import { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { getToken } from "./getToken";

const setAxiosHeader = (
  config: InternalAxiosRequestConfig<unknown>
): InternalAxiosRequestConfig<unknown> => {
  const token = getToken();
  if (token)
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  return config;
};

export default setAxiosHeader;
