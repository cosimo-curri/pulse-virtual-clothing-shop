using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;
using UMA;
using UMA.CharacterSystem;
using WebSocketSharp;

public class CreateClothingScript : MonoBehaviour
{
    public RawImage imageTexture;

    public TMP_InputField priceInput;
    public TMP_Dropdown genderInput;
    public TMP_Dropdown typeInput;
    public TMP_Dropdown materialInput;
    public TMP_InputField quantityInput;
    public TMP_Dropdown sizeInput;
    public TMP_InputField lengthInput;
    public TMP_InputField widthInput;
    public TMP_InputField neckWidthInput;
    public TMP_InputField sleeveWidthInput;

    public Button buttonUpload;
    
    public AudioSource audioSource;

    public Animator animator;

    public Texture2D defaultTexture;
    public OverlayDataAsset tshirtOverlay;

    void Start()
    {
        imageTexture.texture = StaticObjects.texture_uv_map;

        priceInput.onValidateInput += OnValidateInput;
        lengthInput.onValidateInput += OnValidateInput;
        widthInput.onValidateInput += OnValidateInput;
        neckWidthInput.onValidateInput += OnValidateInput;
        sleeveWidthInput.onValidateInput += OnValidateInput;

        sizeInput.onValueChanged.AddListener(OnDropdownValueChanged);
    }

    private char OnValidateInput(string text, int charIndex, char addedChar)
    {
        if(char.IsDigit(addedChar) || addedChar == ',')
        {
            if(addedChar == ',' && text.Contains(","))
            {
                return '\0';
            }
            else if(addedChar == ',' && text == "")
            {
                return '\0';
            }
            else if(addedChar == '0' && text == "")
            {
                return '\0';
            }

            return addedChar;
        }

        return '\0';
    }

    private void OnDropdownValueChanged(int index)
    {
        switch(index)
        {
            //S
            case 0:
                lengthInput.text = "70";
                widthInput.text = "49";
                neckWidthInput.text = "7";
                sleeveWidthInput.text = "9";

                break;
            
            //M
            case 1:
                lengthInput.text = "72";
                widthInput.text = "54";
                neckWidthInput.text = "8";
                sleeveWidthInput.text = "10";

                break;

            //L
            case 2:
                lengthInput.text = "75";
                widthInput.text = "56";
                neckWidthInput.text = "9";
                sleeveWidthInput.text = "11";

                break;
        }
    }

    public void UploadClothing()
    {
        string price = priceInput.text;
        string gender = genderInput.options[genderInput.value].text;
        string type = typeInput.options[typeInput.value].text;
        string material = materialInput.options[materialInput.value].text;
        string quantity = quantityInput.text;
        string size = sizeInput.options[sizeInput.value].text;
        string length = lengthInput.text;
        string width = widthInput.text;
        string neckWidth = neckWidthInput.text;
        string sleeveWidth = sleeveWidthInput.text;

        if(price != "" && type != "" && material != "" && quantity != "" && length != "" && width != "" && neckWidth != "" && sleeveWidth != "")
        {
            float numericPrice = float.Parse(price);
            float numericLength = float.Parse(length);
            float numericWidth = float.Parse(width);
            float numericNeckWidth = float.Parse(neckWidth);
            float numericSleeveWidth = float.Parse(sleeveWidth);

            string roundedPrice = ((float) Math.Round(numericPrice, 2)).ToString().Replace(",", ".");
            string roundedLength = ((float) Math.Round(numericLength, 2)).ToString().Replace(",", ".");
            string roundedWidth = ((float) Math.Round(numericWidth, 2)).ToString().Replace(",", ".");
            string roundedNeckWidth = ((float) Math.Round(numericNeckWidth, 2)).ToString().Replace(",", ".");
            string roundedSleeveWidth = ((float) Math.Round(numericSleeveWidth, 2)).ToString().Replace(",", ".");

            string typeNormalized = "";

            if(type == "T-SHIRT #1")
                typeNormalized = "T_SHIRT_1";

            string url = ListAPI_Script.uploadClothing;

            byte[] bytes = StaticObjects.texture_uv_map.EncodeToPNG();
            string textureBase64String = Convert.ToBase64String(bytes);

            string bodyJsonString = "{ \"price\": \"" + roundedPrice + "\", \"gender\": \"" + gender + "\", \"type\": \"" + typeNormalized + "\", \"material\": \"" + material + "\", \"quantity\": \"" + quantity + "\", \"size\": \"" + size + "\", \"texture\": \"" + textureBase64String + "\", \"shopId\": \"" + LoginScript.loggedUser.shop + "\", \"dimensions\": { \"length\": \"" + roundedLength + "\", \"width\": \"" + roundedWidth + "\", \"neckWidth\": \"" + roundedNeckWidth + "\", \"sleeveWidth\": \"" + roundedSleeveWidth + "\" } }";

            buttonUpload.interactable = false;

            StartCoroutine(Post(url, bodyJsonString, bytes));
        } else
            Handheld.Vibrate();
    }

    IEnumerator Post(string url, string bodyJsonString, byte[] bytes)
    {
        var request = new UnityWebRequest(url, "POST");

        byte[] bodyRaw = Encoding.UTF8.GetBytes(bodyJsonString);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();

        request.SetRequestHeader("token", LoginScript.loggedUser.currentValidToken);
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if(request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError)
        {
            Handheld.Vibrate();
            buttonUpload.interactable = true;
        }
        else
        {
            string responseData = request.downloadHandler.text;

            CreateClothingServerResponse createClothingServerResponse = JsonUtility.FromJson<CreateClothingServerResponse>(responseData);

            switch(createClothingServerResponse.message)
            {
                case "TOKEN_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN":
                case "UPLOAD_ERROR":
                    Handheld.Vibrate();
                    buttonUpload.interactable = true;
                    break;
                
                case "UPLOAD_OK":
                    audioSource.Play();
                    StaticObjects.texture_uv_map = null;
                    tshirtOverlay.textureList[0] = defaultTexture;

                    using(var ws = new WebSocket(ListAPI_Script.SOCKET_URL)) {            
                        ws.Connect();
                        ws.Send(createClothingServerResponse.clothing);
                    }

                    StartCoroutine(LoadScene());
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

    void Update()
    {}
}

[System.Serializable]
public class CreateClothingServerResponse
{
    public string message;
    public string clothing;
}