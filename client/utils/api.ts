import axios from "axios";

const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchMentions = async () => {
  const res = await axios.get(`${backend}/api/mentions`);
  return res.data;
};
