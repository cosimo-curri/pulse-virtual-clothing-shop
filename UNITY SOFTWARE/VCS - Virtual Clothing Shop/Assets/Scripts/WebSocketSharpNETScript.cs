using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using TMPro;
using UnityEngine.UI;
using WebSocketSharp;

public class WebSocketSharpNETScript : MonoBehaviour
{
    private WebSocket ws;

    private Clothing clothingSocketImport;
    private bool x = false;

    public GameObject listItemPrefab;
    public Transform listItemHolder;
    public ToggleGroup toggleGroup;

    void Start()
    {
        ws = new WebSocket(ListAPI_Script.SOCKET_URL);

        ws.OnMessage += (sender, e) => {
            string newClothingString = e.Data;

            Clothing clothingSocket = JsonUtility.FromJson<Clothing>(newClothingString);

            clothingSocketImport = clothingSocket;
            x = true;
        };

        ws.Connect();
    }

    void Update()
    {
        if(x)
        {
            StartCoroutine(DownloadTexture(clothingSocketImport));
        }
    }

    IEnumerator DownloadTexture(Clothing clothing)
    {
        x = false;

        if(Net_Manager_GetSede.VAT_negozio == clothing.VAT)
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
                ScriptProgressBar.listaCapiAbbigliamento.AddLast(clothing);

                if(SceneManager.GetActiveScene().name == "CatalogScene" && listItemPrefab != null && listItemHolder != null && toggleGroup != null)
                {
                    int i = ScriptProgressBar.listaCapiAbbigliamento.Count - 1;

                    string typeNormalized = "";
                    string materialNormalized = "";

                    switch(clothing.type)
                    {
                        case "T_SHIRT_1":
                            typeNormalized = "T-SHIRT #1";
                            break;
                    }

                    switch(clothing.material)
                    {
                        case "COTTON":
                            materialNormalized = "COTONE";
                            break;

                        case "RUBBER":
                            materialNormalized = "RUBBER";
                            break;

                        case "WOOL":
                            materialNormalized = "LANA";
                            break;

                        case "LEATHER":
                            materialNormalized = "PELLE";
                            break;

                        case "FUR":
                            materialNormalized = "PELLICCIA";
                            break;

                        case "POLYESTER":
                            materialNormalized = "POLIESTERE";
                            break;

                        case "VELVET":
                            materialNormalized = "VELLUTO";
                            break;
                    }

                    TMP_Text[] t = listItemPrefab.GetComponentsInChildren<TMP_Text>();

                    t[0].text = typeNormalized + " (" + materialNormalized + ")";
                    t[1].text = "Taglia: " + clothing.size;
                    t[2].text = "Prezzo: " + clothing.price + " €";
                    t[3].text = "Quantità disponibile: ";
                    t[4].text = "" + clothing.quantity;
                    t[5].name = "Q" + i;

                    listItemPrefab.GetComponentInChildren<Toggle>().name = "T" + i;
                    listItemPrefab.GetComponentInChildren<Toggle>().group = toggleGroup;

                    Button[] b = listItemPrefab.GetComponentsInChildren<Button>();

                    b[0].name = "B" + i;
                    b[1].name = "I" + i;
                    b[2].name = "A" + i;
                    b[3].name = "M" + i;
                    b[4].name = "P" + i;
                    
                    Instantiate(listItemPrefab, listItemHolder);
                }
            }
        }
    }

    void OnDestroy()
    {
        ws.Close();
    }
}