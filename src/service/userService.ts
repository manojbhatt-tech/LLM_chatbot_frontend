import AxiosHelper from "@/helpers/axiosHelper";

const USER_API = {
  PROFILE: "/auth/me",
};

const UserService = {
  getProfile: async () => {
    return AxiosHelper.getData(USER_API.PROFILE);
  },
};

export default UserService;
