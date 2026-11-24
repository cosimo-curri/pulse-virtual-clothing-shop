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

public class net_Manager_GetAvatar : MonoBehaviour
{
    public GameObject listItemPrefab;
    public Transform listItemHolder;
    public ToggleGroup toggleGroup;
    public RawImage loadingImage;

    public static string nomeAvatar;
    public static string avatarRecipe;
    public static string[] allergiesArrayAvatar;

    string[] nomiAvatar;
    string[] avatarRecipeArray;
    string[][] allergiesArray;

    void Start()
    {
        string url = ListAPI_Script.getAllUserAvatars;

        StartCoroutine(GetRequest(url));
    }

    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("ShopSelectScene");
        }

        Toggle toggle = listItemPrefab.GetComponentInChildren<Toggle>();
        toggle.group = toggleGroup;
    }

    public void btnSeleziona()
    {
        bool check = false;

        for(int i=0; i<nomiAvatar.Length; i++)
        {
            if(currentSelection && currentSelection.name.Equals("T" + i))
            {
                check = true;

                nomeAvatar = nomiAvatar[i];
                avatarRecipe = Base64Decode(avatarRecipeArray[i]);
                allergiesArrayAvatar = allergiesArray[i];
            }
        }

        if(!check)
        {
            ModalManager.Show("ATTENZIONE", "Non hai selezionato alcun avatar", new[] { new ModalButton() { Text = "OK" } });
        }
        else
        {
            StartCoroutine(ShopSceneOpen());
        }
    }

    public void btnCrea()
    {
        StartCoroutine(AvatarCreationSceneOpen());
    }

    IEnumerator ShopSceneOpen()
    {
        float minDisplayTime = 0.5f;
        float startTime = Time.realtimeSinceStartup;

        loadingImage.gameObject.SetActive(true);

        while(Time.realtimeSinceStartup - startTime < minDisplayTime)
        {
            yield return null;
        }

        SceneManager.LoadScene("Negozio - Entrata");
    }

    IEnumerator AvatarCreationSceneOpen()
    {
        float minDisplayTime = 0.5f;
        float startTime = Time.realtimeSinceStartup;

        loadingImage.gameObject.SetActive(true);

        while(Time.realtimeSinceStartup - startTime < minDisplayTime)
        {
            yield return null;
        }

        SceneManager.LoadScene("AvatarCreationScene");
    }

    public Toggle currentSelection
    {
        get { return toggleGroup.ActiveToggles().FirstOrDefault(); }
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

                    GetAvatarsServerResponse getAvatarsServerResponse = JsonUtility.FromJson<GetAvatarsServerResponse>(responseData);

                    switch(getAvatarsServerResponse.message) {
                        case "TOKEN_NOT_PROVIDED":
                        case "CANNOT_VERIFY_TOKEN":
                        case "USER_NOT_LOGGED":
                        case "GET_ALL_AVATARS_ERROR":
                            SceneManager.LoadScene("LoginScene");
                            break;

                        case "GET_ALL_AVATARS_OK":
                            int avatarsListLength = getAvatarsServerResponse.avatars.Length;

                            nomiAvatar = new string[avatarsListLength];
                            avatarRecipeArray = new string[avatarsListLength];
                            allergiesArray = new string[avatarsListLength][];

                            int count = 0;

                            foreach(Avatar avatar in getAvatarsServerResponse.avatars)
                            {
                                nomiAvatar[count] = avatar.name;
                                avatarRecipeArray[count] = avatar.avatarRecipe;
                                allergiesArray[count] = avatar.allergies;

                                TMP_Text[] t = listItemPrefab.GetComponentsInChildren<TMP_Text>();
                                t[0].text = nomiAvatar[count];
                                t[1].text = "";
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

    public static string Base64Decode(string base64EncodedData)
    {
        var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
        return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
    }
}

[System.Serializable]
public class GetAvatarsServerResponse
{
    public string message;
    public Avatar[] avatars;
}

[System.Serializable]
public class Avatar
{
    public string name;
    public string avatarRecipe;
    public string[] allergies;
}