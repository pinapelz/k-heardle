
import { Info } from "../types/info";

export const fetchInfo = async (): Promise<Info> => {
  const API_URL = process.env.REACT_APP_API_URL || "https://localhost:3000";
  const response = await fetch(`${API_URL}/info`);
  const data = await response.json();
  return data as Info;
};
