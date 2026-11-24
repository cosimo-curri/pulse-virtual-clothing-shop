using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using TMPro;
using UnityEngine.SceneManagement;

public class LoginScript : MonoBehaviour
{
    public Transform notifyTransform;
    public TextMeshProUGUI textNotify;

    public TMP_InputField inputEmail;
    public TMP_InputField inputPassword;
    public TextMeshProUGUI textHideManagement;
    public Button buttonSignIn;

    public Toggle rememberMe;

    private bool hide = true;

    private float showNotifyDuration = 1f;
    private bool isMoving = false;
    private bool isOnScreen = false;

    private string emailSaving;
    private string passwordSaving;

    public Animator animator;

    public static User loggedUser;

    public void ManageHide()
    {
        if(hide)
        {
            textHideManagement.text = "Hide";
            inputPassword.contentType = TMP_InputField.ContentType.Standard;
        }
        else
        {
            textHideManagement.text = "Show";
            inputPassword.contentType = TMP_InputField.ContentType.Password;
        }

        inputPassword.ForceLabelUpdate();

        hide = !hide;
    }

    public void Login()
    {
        string email = inputEmail.text;
        string password = inputPassword.text;

        if(email == "" || password == "")
        {
            ShowNotification("Both fields are required");
        }
        else
        {
            string url = ListAPI_Script.signin;
            string bodyJsonString = "{ \"username\": \"" + email + "\", \"password\": \"" + password + "\" }";

            emailSaving = email;
            passwordSaving = password;

            buttonSignIn.interactable = false;

            StartCoroutine(Post(url, bodyJsonString, "LOGIN"));
        }
    }

    public void RestorePassword()
    {
        string email = inputEmail.text;

        if(email == "")
        {
            ShowNotification("Enter your e-mail address");
        }
        else
        {
            string url = ListAPI_Script.restorePassword;
            string bodyJsonString = "{ \"email\": \"" + email + "\" }";

            buttonSignIn.interactable = false;

            StartCoroutine(Post(url, bodyJsonString, "RESTORE_PASSWORD"));
        }
    }

    IEnumerator Post(string url, string bodyJsonString, string requestType)
    {
        var request = new UnityWebRequest(url, "POST");

        byte[] bodyRaw = Encoding.UTF8.GetBytes(bodyJsonString);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if(request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError)
        {
            ShowNotification("An error occurred");
            buttonSignIn.interactable = true;
        }
        else
        {
            string responseData = request.downloadHandler.text;

            switch(requestType)
            {
                case "RESTORE_PASSWORD":
                    RestorePasswordServerResponse restorePasswordServerResponse = JsonUtility.FromJson<RestorePasswordServerResponse>(responseData);

                    switch(restorePasswordServerResponse.message)
                    {
                        case "RESTORE_PASSWORD_ERROR":
                        case "EMAIL_SEND_ERROR":
                            ShowNotification("An error occurred");
                            break;

                        case "USER_NOT_FOUND":
                            ShowNotification("User not found");
                            break;

                        case "EMAIL_SEND_OK":
                            ShowNotification("Check your e-mail");
                            break;
                    }
            
                    inputEmail.text = "";
                    inputPassword.text = "";
                    buttonSignIn.interactable = true;

                    break;

                case "LOGIN":
                    LoginServerResponse loginServerResponse = JsonUtility.FromJson<LoginServerResponse>(responseData);

                    switch(loginServerResponse.message)
                    {
                        case "USER_NOT_EXISTS":
                            inputEmail.text = "";
                            inputPassword.text = "";

                            buttonSignIn.interactable = true;

                            ShowNotification("The user doesn't exist");
                            break;

                        case "USER_NOT_ACTIVE":
                            inputEmail.text = "";
                            inputPassword.text = "";

                            buttonSignIn.interactable = true;
                            
                            ShowNotification("The user isn't active");
                            break;

                        case "SIGNIN_OK":
                            string shopId = loginServerResponse.user.shop;

                            if(shopId == null)
                            {
                                inputEmail.text = "";
                                inputPassword.text = "";

                                buttonSignIn.interactable = true;

                                ShowNotification("You don't have a shop associated");
                            }
                            else{
                                if(rememberMe.isOn)
                                {
                                    PlayerPrefs.SetString("email", emailSaving);
                                    PlayerPrefs.SetString("password", passwordSaving);
                                }
                                else
                                {
                                    PlayerPrefs.SetString("email", "");
                                    PlayerPrefs.SetString("password", "");
                                }

                                PlayerPrefs.Save();

                                loggedUser = loginServerResponse.user;

                                StartCoroutine(LoadScene());
                            }

                            break;
                    }

                    break;
            }
        }
    }

    IEnumerator LoadScene()
    {
        animator.Play("ExpandCircleOnClick");
        yield return new WaitForSeconds(2.3f);
        SceneManager.LoadScene("PhotoScene");
    }

    void ShowNotification(string message)
    {
        textNotify.text = message;

        if(!isOnScreen)
        {
            isMoving = true;
            isOnScreen = true;
        }
    }

    void Start()
    {
        inputPassword.asteriskChar = '•';

        string emailSaved = PlayerPrefs.GetString("email", "");
        string passwordSaved = PlayerPrefs.GetString("password", "");

        if(emailSaved != "" && passwordSaved != "")
        {
            inputEmail.text = emailSaved;
            inputPassword.text = passwordSaved;

            rememberMe.isOn = true;
        }
        else
        {
            rememberMe.isOn = false;
        }
    }

    void Update()
    {
        if(isMoving)
        {
            showNotifyDuration -= Time.deltaTime;

            float percentageComplete = 1 - (showNotifyDuration / 1f);

            float startY = -200f;
            float endY = 250f;

            float newY = Mathf.Lerp(startY, endY, percentageComplete);

            Vector3 targetPosition = new Vector3(notifyTransform.position.x, newY, notifyTransform.position.z);
            notifyTransform.position = Vector3.Lerp(notifyTransform.position, targetPosition, Time.deltaTime * 5f);

            if(showNotifyDuration <= 0f)
            {
                isMoving = false;
            }
        }
    }
}

[System.Serializable]
public class RestorePasswordServerResponse
{
    public string message;
}

[System.Serializable]
public class LoginServerResponse
{
    public string message;
    public User user;
}

[System.Serializable]
public class User
{
    public string currentValidToken;
    public string shop;
}