using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UMA;
using UMA.CharacterSystem;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class Net_Manager_Carrello : MonoBehaviour
{
    public GameObject listItemPrefab;
    public Transform listItemHolder;
    public ToggleGroup toggleGroup;
    public GameObject avatar;
    public DynamicCharacterAvatar avatarUMA;
    public GameObject cam;
    public TMP_Text prezzoTot;
    public DynamicCharacterAvatar avatarRace;
    public static float prezzoTotale;
    public static string sesso;

    public static int[] clothingMaxQuantityReferences;

    public OverlayDataAsset tshirtOverlay;

    void Start()
    {
        prezzoTotale = 0;

        string avatarRecipe = net_Manager_GetAvatar.avatarRecipe;

        avatarRace.LoadFromRecipeString(avatarRecipe);

        if(avatarRace.RacePreset.ToString().Equals("HumanMale"))
        {
            avatarUMA.ChangeRace("HumanMale");
            sesso = "MALE";
        }
        else if(avatarRace.RacePreset.ToString().Equals("HumanFemale"))
        {
            avatarUMA.ChangeRace("HumanFemale");
            sesso = "FEMALE";
        }

        avatarRace.BuildCharacter();
        
        if(!Net_Manager_Catalogo.listaCapiCarrello.IsUnityNull())
        {
            int count = 0;

            string[] nomeArticolo = new string[Net_Manager_Catalogo.listaCapiCarrello.Count];
            string[] tagliaArticolo = new string[Net_Manager_Catalogo.listaCapiCarrello.Count];
            float[] prezzoArticolo = new float[Net_Manager_Catalogo.listaCapiCarrello.Count];
            int[] quantitaArticolo = new int[Net_Manager_Catalogo.listaCapiCarrello.Count];

            clothingMaxQuantityReferences = new int[Net_Manager_Catalogo.listaCapiCarrello.Count];

            foreach(Clothing clothing in Net_Manager_Catalogo.listaCapiCarrello)
            {
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
                        materialNormalized = "COTONE";
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
                
                nomeArticolo[count] = typeNormalized + " (" + materialNormalized + ")";
                tagliaArticolo[count] = clothing.size;
                prezzoArticolo[count] = clothing.price;
                quantitaArticolo[count] = clothing.cartQuantity;

                clothingMaxQuantityReferences[count] = clothing.quantity; //USEFUL FOR THE CART

                prezzoTotale = prezzoTotale + (clothing.price * clothing.cartQuantity);

                count++;
            }

            prezzoTot.text = "Totale: " + prezzoTotale.ToString() + " €";

            for(int i=0; i<Net_Manager_Catalogo.listaCapiCarrello.Count; i++)
            {
                TMP_Text[] t = listItemPrefab.GetComponentsInChildren<TMP_Text>();

                t[0].text = nomeArticolo[i];
                t[1].text = "Taglia: " + tagliaArticolo[i];
                t[2].text = "Prezzo: " + prezzoArticolo[i].ToString() + " €";
                t[3].text = "Quantità desiderata: ";
                t[4].text = quantitaArticolo[i].ToString();
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

    public Toggle currentSelection
    {
        get { return toggleGroup.ActiveToggles().FirstOrDefault(); }
    }

    void Update()
    {
        prezzoTot.text = "Totale: " + prezzoTotale.ToString() + " €";

        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("Negozio - Entrata");
        }

        avatar.transform.Rotate(0, 50 * Time.deltaTime, 0);

        if(!Net_Manager_Catalogo.listaCapiCarrello.IsUnityNull())
        {
            for(int i=0; i<Net_Manager_Catalogo.listaCapiCarrello.Count; i++)
            {
                if(currentSelection.name.Equals("T" + i))
                {
                    int count = 0;

                    foreach(Clothing clothing in Net_Manager_Catalogo.listaCapiCarrello)
                    {
                        if(count == i)
                        {
                            avatarUMA.ClearSlots();

                            if(avatarUMA.activeRace.racedata.ToString().Contains("Human Male"))
                            {
                                avatarUMA.SetSlot("Underwear", "MaleUnderwear");
                            }
                            else
                            {
                                avatarUMA.SetSlot("Underwear", "FemaleUndies2");
                            }

                            if(sesso.Equals(clothing.gender.ToString()))
                            {
                                string currentUMASlot = "";
                                string currentUMAElement = "";

                                switch(clothing.type)
                                {
                                    case "T_SHIRT_1":
                                        currentUMASlot = "Chest";
                                        currentUMAElement = "pulse_tshirt_Recipe";

                                        tshirtOverlay.textureList[0] = clothing.texture;

                                        break;
                                }

                                avatarUMA.SetSlot(currentUMASlot, currentUMAElement);
                            }

                            avatarUMA.BuildCharacter();

                            if(clothing.type.ToString().Equals("T_SHIRT_1"))
                            {
                                torso();
                            }
                        }

                        count++;
                    }
                }
            }
        }
    }

    public void torso()
    {
        cam.transform.position = new Vector3(0, 1.189f, 2.132f);
    }

    public void gambe()
    {
        cam.transform.position = new Vector3(0, 0.57f, 2.132f);
    }

    public void piedi()
    {
        cam.transform.position = new Vector3(0, 0.25f, 2.132f);
    }

    public void testa()
    {
        cam.transform.position = new Vector3(0, 1.6f, 2.132f);
    }
}