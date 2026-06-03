
import { Info } from "../types/info";

export const fetchInfo = async (): Promise<Info> => {
  const API_URL = import.meta.env.VITE_APP_HEARDLE_API_URL || "http://localhost:3000";
  const response = await fetch(`${API_URL}/info`);
  const data = await response.json();
  return data as Info;
};
