using Gravitons.UI.Modal;
using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using System.Text;
using Newtonsoft.Json;
using UnityEngine.UI;

public class Net_Manager_Recupera : MonoBehaviour
{
    public TMP_InputField mail_In;
    public RawImage loadingImage;

    public void recupera_password()
    {
        string mail = mail_In.text.ToString();
        
        if(mail == "")
        {
            ModalManager.Show("ATTENZIONE", "Tutti i campi sono obbligatori", new[] { new ModalButton() { Text = "OK" } });
        }
        else
        {
            string url = ListAPI_Script.restorePassword;
            string bodyJsonString = "{ \"email\": \"" + mail + "\" }";

            StartCoroutine(Post(url, bodyJsonString));
        }
    }

    IEnumerator Post(string url, string bodyJsonString)
    {
        float minDisplayTime = 0.5f;
        float startTime = Time.realtimeSinceStartup;

        loadingImage.gameObject.SetActive(true);

        while(Time.realtimeSinceStartup - startTime < minDisplayTime)
        {
            yield return null;
        }

        var request = new UnityWebRequest(url, "POST");

        byte[] bodyRaw = Encoding.UTF8.GetBytes(bodyJsonString);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        loadingImage.gameObject.SetActive(false);
        
        if(request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError)
        {
            ModalManager.Show("ATTENZIONE", "È stato riscontrato un errore di rete", new[] { new ModalButton() { Text = "OK" } });
            mail_In.text = "";
        }
        else
        {
            string responseData = request.downloadHandler.text;

            RestorePasswordServerResponse restorePasswordServerResponse = JsonUtility.FromJson<RestorePasswordServerResponse>(responseData);

            switch(restorePasswordServerResponse.message)
            {
                case "RESTORE_PASSWORD_ERROR":
                case "EMAIL_SEND_ERROR":
                    ModalManager.Show("ATTENZIONE", "È stato riscontrato un errore inatteso", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "USER_NOT_FOUND":
                    ModalManager.Show("ATTENZIONE", "L'utente non esiste", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "EMAIL_SEND_OK":
                    ModalManager.Show("SUCCESSO", "Controlla la tua casella di posta elettronica", new[] { new ModalButton() { Text = "OK" } });
                    break;
            }

            mail_In.text = "";
        }
    }

    void Start()
    {}

    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("LoginScene");
        }
    }
}

[System.Serializable]
public class RestorePasswordServerResponse
{
    public string message;
}