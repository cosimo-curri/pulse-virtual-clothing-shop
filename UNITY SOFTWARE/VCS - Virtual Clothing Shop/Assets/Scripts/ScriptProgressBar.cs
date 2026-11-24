using System.Collections;
using System.Collections.Generic;
using System;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using Gravitons.UI.Modal;
using UMA;
using TMPro;
using Newtonsoft.Json;

public class ScriptProgressBar : MonoBehaviour
{
    public ProgressBar pb;
    public TMP_Text textDownload;
    public static Texture2D defaultTexture;

    private int percPerFile;

    public static LinkedList<Clothing> listaCapiAbbigliamento;

    void Start()
    {
        string VAT_negozio_scelto = Net_Manager_GetSede.VAT_negozio;

        string url = ListAPI_Script.getAllClothingsByShopVAT + "/" + VAT_negozio_scelto;

        StartCoroutine(GetRequest(url));
    }

    IEnumerator GetRequest(string url)
    {
        using(UnityWebRequest webRequest = UnityWebRequest.Get(url))
        {
            webRequest.SetRequestHeader("token", Net_Manager_Login.loggedUser.currentValidToken);

            yield return webRequest.SendWebRequest();

            switch(webRequest.result)
            {
                case UnityWebRequest.Result.ConnectionError:
                case UnityWebRequest.Result.DataProcessingError:
                case UnityWebRequest.Result.ProtocolError:
                    SceneManager.LoadScene("LoginScene");
                    break;

                case UnityWebRequest.Result.Success:
                    string responseData = webRequest.downloadHandler.text;
                    
                    GetAllClothingsServerResponse getAllClothingsServerResponse = JsonUtility.FromJson<GetAllClothingsServerResponse>(responseData);

                    switch(getAllClothingsServerResponse.message) {
                        case "TOKEN_NOT_PROVIDED":
                        case "CANNOT_VERIFY_TOKEN":
                        case "USER_NOT_LOGGED":
                        case "GET_CLOTHINGS_ERROR":
                            SceneManager.LoadScene("LoginScene");
                            break;

                        case "GET_CLOTHINGS_OK":
                            listaCapiAbbigliamento = new LinkedList<Clothing>(getAllClothingsServerResponse.clothings);

                            if(listaCapiAbbigliamento.Count > 0)
                            {
                                float percValue = 100f / listaCapiAbbigliamento.Count;
                                percPerFile = (int) Math.Ceiling(percValue);
                            }
                            else
                            {
                                pb.BarValue = 100;
                                textDownload.text = "Download: " + pb.BarValue + "%";
                                SceneManager.LoadScene("ChooseAvatarScene");
                            }

                            foreach(Clothing clothing in listaCapiAbbigliamento)
                            {
                                yield return StartCoroutine(DownloadTexture(clothing));
                            }

                            SceneManager.LoadScene("ChooseAvatarScene");

                            break;
                    }

                    break;
            }
        }
    }

    IEnumerator DownloadTexture(Clothing clothing)
    {
        UnityWebRequest request = UnityWebRequestTexture.GetTexture(clothing.texturePath);

        yield return request.SendWebRequest();

        if(request.result == UnityWebRequest.Result.ProtocolError || request.result == UnityWebRequest.Result.ProtocolError)
        {
            SceneManager.LoadScene("LoginScene");
        }
        else
        {
            clothing.texture = ((DownloadHandlerTexture) request.downloadHandler).texture;

            if(listaCapiAbbigliamento.Count > 0)
            {
                pb.BarValue = pb.BarValue + percPerFile;
                textDownload.text = "Download: " + pb.BarValue + "%";
            }

            if((pb.BarValue + percPerFile) >= 100)
            {
                pb.BarValue = 100;
                textDownload.text = "Download: " + pb.BarValue + "%";
            }
        }
    }

    void Update()
    {}
}

[System.Serializable]
public class GetAllClothingsServerResponse
{
    public string message;
    public Clothing[] clothings;
}

[System.Serializable]
public class Clothing
{
    public string _id;
    public float price;
    public string gender;
    public string type;
    public string material;
    public int quantity;
    public string size;
    public string texturePath;
    public Dimensions dimensions;

    public int cartQuantity;
    public Texture2D texture;

    public string VAT;

    public Clothing()
    {
        this.cartQuantity = this.quantity;
        this.texture = ScriptProgressBar.defaultTexture;
    }
}

[System.Serializable]
public class Dimensions
{
    public float length;
    public float width;
    public float neckWidth;
    public float sleeveWidth;
}