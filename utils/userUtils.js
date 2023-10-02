import axios from "axios";

export const updateUser = async (userData) => {
  try {
    const response = await axios.put("/api/users/me", userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await axios.get("/api/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
