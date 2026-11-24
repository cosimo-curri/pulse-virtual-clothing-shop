using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UMA;
using UMA.CharacterSystem;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class Net_Manager_Camerino : MonoBehaviour
{
    public DynamicCharacterAvatar avatar;
    public GameObject listItemPrefab;
    public Transform listItemHolder;
    public ToggleGroup toggleGroup;

    public OverlayDataAsset tshirtOverlay;

    void Start()
    {
        string avatarRecipe = net_Manager_GetAvatar.avatarRecipe;

        avatar.LoadFromRecipeString(avatarRecipe);

        if(avatar.activeRace.racedata.ToString().Contains("Human Male"))
        {
            avatar.SetSlot("Underwear", "MaleUnderwear");
        }
        else
        {
            avatar.SetSlot("Underwear", "FemaleUndies2");
        }
        
        avatar.BuildCharacter();

        if(!Net_Manager_Catalogo.listaCapiCarrello.IsUnityNull())
        {
            int count = 0;

            string[] nomeArticolo = new string[Net_Manager_Catalogo.listaCapiCarrello.Count];
            string[] tagliaArticolo = new string[Net_Manager_Catalogo.listaCapiCarrello.Count];
            float[] prezzoArticolo = new float[Net_Manager_Catalogo.listaCapiCarrello.Count];
            int[] quantitaArticolo = new int[Net_Manager_Catalogo.listaCapiCarrello.Count];

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

                count++;
            }

            for(int i=0; i<Net_Manager_Catalogo.listaCapiCarrello.Count; i++)
            {
                TMP_Text[] t = listItemPrefab.GetComponentsInChildren<TMP_Text>();

                t[0].text = nomeArticolo[i];
                t[1].text = "Taglia: " + tagliaArticolo[i];
                t[2].text = "Prezzo: " + prezzoArticolo[i].ToString() + " €";
                t[3].text = "Quantità desiderata: ";
                t[4].text = quantitaArticolo[i].ToString();

                listItemPrefab.GetComponentInChildren<Toggle>().name = "T" + i;
                listItemPrefab.GetComponentInChildren<Toggle>().group = toggleGroup;

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
        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("Negozio - Entrata");
        }

        if(!Net_Manager_Catalogo.listaCapiCarrello.IsUnityNull())
        {
            for(int i=0; i<Net_Manager_Catalogo.listaCapiCarrello.Count; i++)
            {
                if(toggleGroup.AnyTogglesOn())
                {
                    if(currentSelection.name.Equals("T" + i))
                    {
                        int count = 0;

                        foreach(Clothing clothing in Net_Manager_Catalogo.listaCapiCarrello)
                        {
                            if(count == i)
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

                                avatar.SetSlot(currentUMASlot, currentUMAElement);
                                avatar.BuildCharacter();
                            }

                            count++;
                        }
                    }
                }
            }
        }
    }

    public void btnRemoveTesta()
    {
        foreach(Toggle toggle in toggleGroup.GetComponentsInChildren<Toggle>())
        {
            toggle.isOn = false;
        }

        avatar.ClearSlot("Helmet");
        avatar.BuildCharacter();
    }

    public void btnRemoveTorso()
    {
        foreach(Toggle toggle in toggleGroup.GetComponentsInChildren<Toggle>())
        {
            toggle.isOn = false;
        }

        avatar.ClearSlot("Chest");
        avatar.BuildCharacter();
    }

    public void btnRemovePiedi()
    {
        foreach(Toggle toggle in toggleGroup.GetComponentsInChildren<Toggle>())
        {
            toggle.isOn = false;
        }

        avatar.ClearSlot("Feet");
        avatar.BuildCharacter();
    }

    public void btnRemoveGambe()
    {
        foreach(Toggle toggle in toggleGroup.GetComponentsInChildren<Toggle>())
        {
            toggle.isOn = false;
        }
        
        avatar.ClearSlot("Legs");
        avatar.BuildCharacter();
    }
}