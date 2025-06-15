import { axiosInstance } from "./axios";


export const signup = async (signupData) => {
      const response = await axiosInstance.post("/auth/signup", signupData);
      return response.data;
}
export const login = async (loginData) => {
      const response = await axiosInstance.post("/auth/login", loginData);
      return response.data;
}
export const logout = async () => {
      const response = await axiosInstance.post("/auth/logout");
      return response.data;
}

export const getAuthUser = async () => {
      try {
            const response = await axiosInstance.get("/auth/me");
            return response.data;
      } catch (error) {
            console.log("Error fetching authenticated user:", error);
            return null;
      }
}

export const completeOnboarding = async (userData) => {
      const response = await axiosInstance.post("/auth/onboarding", userData);
      return response.data;
}

export const getUserFriends = async () => {
      const response = await axiosInstance.get("/users/friends");
      return response.data;
}

export const getRecommendedUsers = async () => {
      const response = await axiosInstance.get("/users");
      return response.data;
}

export const getOutgoingFriendReqs = async () => {
      const response = await axiosInstance.get("/users/outgoing-friend-request");
      return response.data;
}

export const sendFriendRequest = async (userId) => {
      const response = await axiosInstance.post(`/users/friend-request/${userId}`);
      return response.data;
}