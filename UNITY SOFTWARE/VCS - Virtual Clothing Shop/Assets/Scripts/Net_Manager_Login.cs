using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using UnityEngine.Networking;
using System.Text;
using System.IO;
using System.Xml.Serialization;
using System.Security.Cryptography;
using TMPro;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.InputSystem;
using Gravitons.UI.Modal;
using Newtonsoft.Json;

public class Net_Manager_Login : MonoBehaviour
{
    public TMP_InputField mail_In;
    public TMP_InputField pass_In;
    public Toggle hide_check;
    public Image checkmarker;
    public Sprite hide;
    public Sprite not_hide;
    public Toggle toggleRememberMe;

    public static User loggedUser;

    public void login_Btn()
    {
        string mail = mail_In.text.ToString();
        string pass = pass_In.text.ToString();

        if(mail == "" || pass == "")
        {
            ModalManager.Show("ATTENZIONE", "Tutti i campi sono obbligatori", new[] { new ModalButton() { Text = "OK" } });
        }
        else{
            string url = ListAPI_Script.signin;
            string bodyJsonString = "{ \"username\": \"" + mail + "\", \"password\": \"" + pass + "\" }";

            StartCoroutine(Post(url, bodyJsonString));
        }
    }

    IEnumerator Post(string url, string bodyJsonString)
    {
        var request = new UnityWebRequest(url, "POST");

        byte[] bodyRaw = Encoding.UTF8.GetBytes(bodyJsonString);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();
        
        if(request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError)
        {
            ResetScene();
            ModalManager.Show("ATTENZIONE", "È stato riscontrato un errore di rete", new[] { new ModalButton() { Text = "OK" } });
        }
        else
        {
            string responseData = request.downloadHandler.text;

            LoginServerResponse loginServerResponse = JsonUtility.FromJson<LoginServerResponse>(responseData);

            switch(loginServerResponse.message)
            {
                case "USER_NOT_EXISTS":
                    ResetScene();
                    ModalManager.Show("ATTENZIONE", "L'utente non esiste", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "USER_NOT_ACTIVE":
                    ResetScene();
                    ModalManager.Show("ATTENZIONE", "L'utente non è attivo", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "SIGNIN_OK":
                    loggedUser = loginServerResponse.user;
                    
                    if(toggleRememberMe.isOn)
                    {
                        PlayerPrefs.SetString("email", mail_In.text);
                        PlayerPrefs.SetString("password", pass_In.text);
                    }
                    else
                    {
                        PlayerPrefs.SetString("email", "");
                        PlayerPrefs.SetString("password", "");
                    }

                    SceneManager.LoadScene("ShopSelectScene");
                    break;
            }
        }
    }

    private void ResetScene()
    {
        if(PlayerPrefs.GetString("email") != "" && PlayerPrefs.GetString("password") != "")
        {
            mail_In.text = PlayerPrefs.GetString("email");
            pass_In.text = PlayerPrefs.GetString("password");

            toggleRememberMe.isOn = true;
        }
        else
        {
            mail_In.text = "";
            pass_In.text = "";

            toggleRememberMe.isOn = false;
        }
    }

    public void ExitVCS()
    {
        Application.Quit();
    }

    public void registrati_Btn()
    {
        SceneManager.LoadScene("RegistrationScene");
    }

    public void dimenticata_Btn()
    {
        SceneManager.LoadScene("RestorePasswordScene");
    }

    public void hide_Pass()
    {
        if(hide_check.isOn)
        {
            pass_In.contentType = TMP_InputField.ContentType.Password;
            checkmarker.sprite = not_hide;
        }
        else
        {
            pass_In.contentType = TMP_InputField.ContentType.Standard;
            checkmarker.sprite = hide;
        }
        
        pass_In.ForceLabelUpdate();
    }

    void Start()
    {
        pass_In.asteriskChar = '•';

        if(PlayerPrefs.GetString("email") != "" && PlayerPrefs.GetString("password") != "")
        {
            mail_In.text = PlayerPrefs.GetString("email");
            pass_In.text = PlayerPrefs.GetString("password");

            toggleRememberMe.isOn = true;
        }
    }

    void Update()
    {}
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
    public string email;
}