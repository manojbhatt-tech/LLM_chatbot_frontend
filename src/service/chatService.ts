import AxiosHelper from "@/helpers/axiosHelper";

const CHAT_API = {
  CREATE: "/chats",
  GET_ALL: (type: string) => `/chats/list/${type}`, // CUSTOM_MODEL, ADMIN_SPECIFIED_MODEL
  GET_BY_ID: (id: string) => `/chats/${id}`,
  ADD_MESSAGE: (id: string) => `/chats/${id}/messages`,
  DELETE: (id: string) => `/chats/${id}`,
  RENAME: (id: string) => `/chats/${id}`,
  share: (id: string) => `/share/${id}`,
};

const ChatService = {
  createChat: async (type: string, title?: string) => {
    return AxiosHelper.postData(CHAT_API.CREATE, { type, title });
  },

  getChats: async (type: string) => {
    return AxiosHelper.getData(CHAT_API.GET_ALL(type));
  },

  getChatById: async (id: string) => {
    return AxiosHelper.getData(CHAT_API.GET_BY_ID(id));
  },

  addMessage: async (id: string, text: string, isDbEnabled: boolean) => {
    return AxiosHelper.postData(CHAT_API.ADD_MESSAGE(id), {
      text,
      isDbEnabled,
    });
  },

  deleteChat: async (id: string) => {
    return AxiosHelper.deleteData(CHAT_API.DELETE(id));
  },

  renameChat: async (id: string, title: string) => {
    return AxiosHelper.patchData(CHAT_API.RENAME(id), { title });
  },

  getSharedChat: async (shareId: string) => {
    return AxiosHelper.getData(CHAT_API.share(shareId));
  },
};

export default ChatService;
