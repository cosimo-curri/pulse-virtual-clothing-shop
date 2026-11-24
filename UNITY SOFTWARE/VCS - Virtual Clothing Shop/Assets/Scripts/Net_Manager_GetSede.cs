using System.Collections;
using System.Collections.Generic;
using System.IO;
using System;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;
using System.Linq;
using Gravitons.UI.Modal;
using Newtonsoft.Json;

public class Net_Manager_GetSede : MonoBehaviour
{
    public GameObject listItemPrefab;
    public Transform listItemHolder;
    public ToggleGroup toggleGroup;
    public RawImage loadingImage;

    public static String VAT_negozio;
    public static String nomeNegozio;

    string[] VAT_sede;
    string[] nomiSede;
    string[] indirizziSede;

    void Start()
    {
        string url = ListAPI_Script.getShopsList;

        StartCoroutine(GetRequest(url));
    }

    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Escape)) {
            SceneManager.LoadScene("LoginScene");
        }
    }

    public Toggle currentSelection
    {
        get { return toggleGroup.ActiveToggles().FirstOrDefault(); }
    }

    public void btnConferma()
    {
        bool check = false;

        for(int i=0; i<VAT_sede.Length; i++)
        {
            if(currentSelection && currentSelection.name.Equals("T" + i))
            {
                check = true;

                VAT_negozio = VAT_sede[i];
                nomeNegozio = nomiSede[i] + ", " + indirizziSede[i];
            }
        }

        if(!check)
        {
            ModalManager.Show("ATTENZIONE", "Non hai selezionato alcun negozio", new[] { new ModalButton() { Text = "OK" } });
        }
        else 
        {
            SceneManager.LoadScene("ProgressBarScene");
        }
    }

    IEnumerator GetRequest(string url)
    {
        using(UnityWebRequest webRequest = UnityWebRequest.Get(url))
        {
            webRequest.SetRequestHeader("token", Net_Manager_Login.loggedUser.currentValidToken);

            float minDisplayTime = 0.5f;
            float startTime = Time.realtimeSinceStartup;

            loadingImage.gameObject.SetActive(true);

            while(Time.realtimeSinceStartup - startTime < minDisplayTime)
            {
                yield return null;
            }

            yield return webRequest.SendWebRequest();

            loadingImage.gameObject.SetActive(false);

            switch(webRequest.result)
            {
                case UnityWebRequest.Result.ConnectionError:
                case UnityWebRequest.Result.DataProcessingError:
                case UnityWebRequest.Result.ProtocolError:
                    SceneManager.LoadScene("LoginScene");
                    break;

                case UnityWebRequest.Result.Success:
                    string responseData = webRequest.downloadHandler.text;

                    GetShopsServerResponse getShopsServerResponse = JsonUtility.FromJson<GetShopsServerResponse>(responseData);

                    switch(getShopsServerResponse.message) {
                        case "TOKEN_NOT_PROVIDED":
                        case "CANNOT_VERIFY_TOKEN":
                        case "USER_NOT_LOGGED":
                        case "GET_SHOPS_ERROR":
                            SceneManager.LoadScene("LoginScene");
                            break;

                        case "GET_SHOPS_OK":
                            int shopsListLength = getShopsServerResponse.shops.Length;

                            VAT_sede = new string[shopsListLength];
                            nomiSede = new string[shopsListLength];
                            indirizziSede = new string[shopsListLength];

                            int count = 0;

                            foreach(Shop shop in getShopsServerResponse.shops)
                            {
                                VAT_sede[count] = shop.VAT;
                                nomiSede[count] = shop.name;
                                indirizziSede[count] = shop.address.street + ", " + shop.address.civic + ", " + shop.address.ZIP;

                                TMP_Text[] t = listItemPrefab.GetComponentsInChildren<TMP_Text>();
                                t[0].text = nomiSede[count];
                                t[1].text = indirizziSede[count];
                                listItemPrefab.GetComponentInChildren<Toggle>().name = "T" + count;
                                listItemPrefab.GetComponentInChildren<Toggle>().group = toggleGroup;
                                Instantiate(listItemPrefab, listItemHolder);

                                count++;
                            }

                            break;
                    }

                    break;
            }
        }
    }
}

[System.Serializable]
public class GetShopsServerResponse
{
    public string message;
    public Shop[] shops;
}

[System.Serializable]
public class Shop
{
    public string VAT;
    public string name;
    public Address address;
}

[System.Serializable]
public class Address
{
    public string street;
    public string civic;
    public string ZIP;
}