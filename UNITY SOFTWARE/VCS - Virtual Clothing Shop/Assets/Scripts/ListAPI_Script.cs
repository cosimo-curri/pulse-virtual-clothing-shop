public class ListAPI_Script
{
    public static string BASE_URL = "http://172.20.10.4:3000";
    public static string SOCKET_URL = "ws://172.20.10.4:3002";

    public static string HUMAN_ACQUISITION_URL = "http://localhost:3001/humanAcquisition";

    public static string signin = BASE_URL + "/api/signin";
    public static string signup = BASE_URL + "/api/signup";
    public static string restorePassword = BASE_URL + "/api/managePassword/requestRestorePassword";
    public static string getShopsList = BASE_URL + "/tokenApi/users/getShopsList";
    public static string getAllClothingsByShopVAT = BASE_URL + "/tokenApi/users/getAllClothingsByShopVAT"; //PARAMS
    public static string createAvatar = BASE_URL + "/tokenApi/users/createAvatar";
    public static string getAllUserAvatars = BASE_URL + "/tokenApi/users/getAllUserAvatars";
    public static string humanAcquisition = BASE_URL + "/tokenApi/users/humanAcquisition";
}