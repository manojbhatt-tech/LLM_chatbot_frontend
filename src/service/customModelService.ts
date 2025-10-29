import AxiosHelper from "@/helpers/axiosHelper";

const CUSTOM_MODEL_API = {
  GET_MODELS: "/custom-model/models", // POST METHOD
  ADD_MESSAGE: (id: string) => `/custom-model/${id}/messages`,
};

const CustomModelService = {
  getModels: async (token?: string) => {
    return AxiosHelper.postData(CUSTOM_MODEL_API.GET_MODELS, {
      token: token,
    });
  },

  addMessage: async (id: string, bodyData: any) => {
    return AxiosHelper.postData(CUSTOM_MODEL_API.ADD_MESSAGE(id), bodyData);
  },
};

export default CustomModelService;
