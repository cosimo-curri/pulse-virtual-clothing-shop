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
using System.Linq;
using UnityEngine.InputSystem;
using Gravitons.UI.Modal;
using Newtonsoft.Json;

public class Net_Manager_Registrazione : MonoBehaviour
{
    public TMP_InputField nome_In;
    public TMP_InputField cognome_In;
    public TMP_InputField mail_In;
    public TMP_InputField pass_In;
    public TMP_InputField conf_In;
    public Toggle hide1_check;
    public Toggle hide2_check;
    public Image checkmarker1;
    public Image checkmarker2;
    public Sprite hide;
    public Sprite not_hide;
    public RawImage loadingImage;

    public void registrati_Btn()
    {
        String nome = nome_In.text.ToString();
        String cognome = cognome_In.text.ToString();
        String mail = mail_In.text.ToString();
        String password = pass_In.text.ToString();
        String conferma_pass = conf_In.text.ToString();

        if(nome == "" || cognome == "" || mail == "" || password == "" || conferma_pass == "")
        {
            ModalManager.Show("ATTENZIONE", "Tutti i campi sono obbligatori", new[] { new ModalButton() { Text = "OK" } });
        }
        else if(!password.Equals(conferma_pass))
        {
            pass_In.text = "";
            conf_In.text = "";

            ModalManager.Show("ATTENZIONE", "Le password non coincidono", new[] { new ModalButton() { Text = "OK" } });
        }
        else
        {
            string url = ListAPI_Script.signup;
            string bodyJsonString = "{ \"email\": \"" + mail + "\", \"firstName\": \"" + nome + "\", \"lastName\": \"" + cognome + "\", \"password\": \"" + password + "\" }";

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
            nome_In.text = "";
            cognome_In.text = "";
            mail_In.text = "";
            pass_In.text = "";
            conf_In.text = "";

            ModalManager.Show("ATTENZIONE", "È stato riscontrato un errore di rete", new[] { new ModalButton() { Text = "OK" } });
        }
        else
        {
            string responseData = request.downloadHandler.text;

            RegistrationServerResponse registrationServerResponse = JsonUtility.FromJson<RegistrationServerResponse>(responseData);

            switch(registrationServerResponse.message)
            {
                case "NOT_AN_EMAIL":
                    mail_In.text = "";

                    ModalManager.Show("ATTENZIONE", "Non hai inserito un indirizzo e-mail valido", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "WEAK_PASSWORD":
                    pass_In.text = "";
                    conf_In.text = "";
                    
                    ModalManager.Show("ATTENZIONE", "La password è troppo debole!\n\nDeve contenere almeno 8 caratteri di cui:\n• 1 lettera maiuscola\n• 1 lettera minuscola\n• 1 numero\n• 1 carattere speciale", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "UserExistsError":
                    nome_In.text = "";
                    cognome_In.text = "";
                    mail_In.text = "";
                    pass_In.text = "";
                    conf_In.text = "";

                    ModalManager.Show("ATTENZIONE", "L'utente è già registrato", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "ValidationError":
                case "EMAIL_SEND_ERROR":
                    nome_In.text = "";
                    cognome_In.text = "";
                    mail_In.text = "";
                    pass_In.text = "";
                    conf_In.text = "";

                    ModalManager.Show("ATTENZIONE", "È stato riscontrato un errore inatteso", new[] { new ModalButton() { Text = "OK" } });
                    break;

                case "EMAIL_SEND_OK":
                    nome_In.text = "";
                    cognome_In.text = "";
                    mail_In.text = "";
                    pass_In.text = "";
                    conf_In.text = "";

                    ModalManager.Show("SUCCESSO", "Controlla la tua casella di posta elettronica", new[] { new ModalButton() { Text = "OK" } });
                    break;
            }
        }
    }

    public void hide1_Pass()
    {
        if(hide1_check.isOn)
        {
            pass_In.contentType = TMP_InputField.ContentType.Password;
            checkmarker1.sprite = not_hide;
        }
        else
        {
            pass_In.contentType = TMP_InputField.ContentType.Standard;
            checkmarker1.sprite = hide;
        }

        pass_In.ForceLabelUpdate();
    }

    public void hide2_Pass()
    {
        if(hide2_check.isOn)
        {
            conf_In.contentType = TMP_InputField.ContentType.Password;
            checkmarker2.sprite = not_hide;
        }
        else
        {
            conf_In.contentType = TMP_InputField.ContentType.Standard;
            checkmarker2.sprite = hide;
        }

        conf_In.ForceLabelUpdate();
    }

    void Start()
    {}
    
    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Escape)) {
            SceneManager.LoadScene("LoginScene");
        }
    }
}

[System.Serializable]
public class RegistrationServerResponse
{
    public string message;
}