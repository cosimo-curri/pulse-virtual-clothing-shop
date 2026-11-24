public class ListAPI_Script
{
    public static string BASE_URL = "http://172.20.10.4:3000";
    public static string SOCKET_URL = "ws://172.20.10.4:3002";

    public static string signin = BASE_URL + "/api/signin";
    public static string restorePassword = BASE_URL + "/api/managePassword/requestRestorePassword";
    public static string uploadClothing = BASE_URL + "/tokenApi/file/uploadClothing";
}