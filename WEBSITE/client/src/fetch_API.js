const BASE_URL = (process.env.REACT_APP_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || BASE_URL.replace(/^http/, "ws").replace(/:\d+$/, `:${process.env.REACT_APP_SOCKET_PORT || 3002}`);

export const fetch_API = {
    SOCKET_URL,
    signup: BASE_URL + "/api/signup",
    signin: BASE_URL + "/api/signin",
    logout: BASE_URL + "/api/logout",
    requestRestorePassword: BASE_URL + "/api/managePassword/requestRestorePassword",
    findUser: BASE_URL + "/tokenApi/admin/findUser",
    deleteUser: BASE_URL + "/tokenApi/admin/deleteUser",
    createShop: BASE_URL + "/tokenApi/admin/createShop",
    getAllClothingsByShopId: BASE_URL + "/tokenApi/users/getAllClothingsByShopId",
    deleteClothing: BASE_URL + "/tokenApi/users/deleteClothing",
    updateClothing: BASE_URL + "/tokenApi/users/updateClothing",
    getShopsList: BASE_URL + "/tokenApi/users/getShopsList",
    virtualAssistant: BASE_URL + "/tokenApi/users/virtualAssistant",
    predict: BASE_URL + "/api/predict",
    trainingByFeedback: BASE_URL + "/api/trainingByFeedback",
    svd: BASE_URL + "/api/svd"
};
