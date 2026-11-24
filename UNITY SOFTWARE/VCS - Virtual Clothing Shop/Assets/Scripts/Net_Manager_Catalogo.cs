using Gravitons.UI.Modal;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UMA;
using UMA.CharacterSystem;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class Net_Manager_Catalogo : MonoBehaviour
{
    public GameObject listItemPrefab;
    public Transform listItemHolder;
    public ToggleGroup toggleGroup;
    public GameObject avatar;
    public DynamicCharacterAvatar avatarUMA;
    public GameObject cam;
    public DynamicCharacterAvatar avatarRace;

    public static LinkedList<Clothing> listaCapiCarrello = new LinkedList<Clothing>();
    public static int quantitaCarrello;
    public static string sesso;
    public static Dictionary<string, DnaSetter> dna;

    public OverlayDataAsset tshirtOverlay;

    void Start()
    {
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

        dna = avatarRace.GetDNA();

        int count = 0;

        string[] nomeArticolo = new string[ScriptProgressBar.listaCapiAbbigliamento.Count];
        string[] tagliaArticolo = new string[ScriptProgressBar.listaCapiAbbigliamento.Count];
        float[] prezzoArticolo = new float[ScriptProgressBar.listaCapiAbbigliamento.Count];
        int[] quantitaArticolo = new int[ScriptProgressBar.listaCapiAbbigliamento.Count];

        foreach(Clothing clothing in ScriptProgressBar.listaCapiAbbigliamento)
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

            nomeArticolo[count] = typeNormalized + " (" + materialNormalized + ")";
            tagliaArticolo[count] = clothing.size;
            prezzoArticolo[count] = clothing.price;
            quantitaArticolo[count] = clothing.quantity;

            count++;
        }

        for(int i=0; i<ScriptProgressBar.listaCapiAbbigliamento.Count; i++)
        {
            TMP_Text[] t = listItemPrefab.GetComponentsInChildren<TMP_Text>();

            t[0].text = nomeArticolo[i];
            t[1].text = "Taglia: " + tagliaArticolo[i];
            t[2].text = "Prezzo: " + prezzoArticolo[i].ToString() + " €";
            t[3].text = "Quantità disponibile: ";
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

            string currentClothingId = ScriptProgressBar.listaCapiAbbigliamento.ElementAt(i)._id;

            var checkClothingResult = IsClothingInCart(currentClothingId);

            if(checkClothingResult.Item1)
            {
                Button buttonCart = GameObject.Find("A" + i).GetComponent<Button>();
                Button buttonMinus = GameObject.Find("M" + i).GetComponent<Button>();
                Button buttonPlus = GameObject.Find("P" + i).GetComponent<Button>();

                TMP_Text textCartQuantity = GameObject.Find("Q" + i).GetComponent<TMPro.TMP_Text>();
                textCartQuantity.text = checkClothingResult.Item2;

                buttonCart.interactable = false;
                buttonMinus.interactable = false;
                buttonPlus.interactable = false;
            }
        }
    }

    private (bool, string) IsClothingInCart(string clothingId)
    {
        foreach(Clothing clothing in listaCapiCarrello)
        {
            if(clothing._id == clothingId)
            {
                return (true, clothing.cartQuantity.ToString());
            }
        }

        return (false, "");
    }

    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("Negozio - Entrata");
        }

        avatar.transform.Rotate(0, 50 * Time.deltaTime, 0);

        for(int i=0; i<ScriptProgressBar.listaCapiAbbigliamento.Count; i++)
        {
            if(currentSelection.name.Equals("T" + i))
            {
                int count = 0;

                foreach(Clothing clothing in ScriptProgressBar.listaCapiAbbigliamento)
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

    public Toggle currentSelection
    {
        get { return toggleGroup.ActiveToggles().FirstOrDefault(); }
    }

    public static bool btn_AddCarrello_Main(int count, int quantita)
    {
        int i = 0;

        foreach(Clothing clothing in ScriptProgressBar.listaCapiAbbigliamento)
        {
            if(i == count)
            {
                (bool vestibile, string motivazione) = vest_UMA2(dna, clothing, sesso, net_Manager_GetAvatar.allergiesArrayAvatar);

                if(vestibile)
                {
                    clothing.cartQuantity = (short) quantita;
                    listaCapiCarrello.AddLast(clothing);
                    quantitaCarrello = quantitaCarrello + quantita;

                    ModalManager.Show("SUCCESSO", "Articolo aggiunto al carrello", new[] { new ModalButton() { Text = "OK" } });
                } 
                else
                {
                    ModalManager.Show("ATTENZIONE", motivazione, new[] { new ModalButton() { Text = "OK" } });
                }

                return vestibile;
            }

            i++;
        }

        return false;
    }

    public static void btn_info_Main(int count)
    {
        int i = 0;

        foreach(Clothing clothing in ScriptProgressBar.listaCapiAbbigliamento)
        {
            if(i == count)
            {
                if(clothing.type.Equals("T_SHIRT_1"))
                {
                    ModalManager.Show(
                        "INFORMAZIONI",
                        "• Lunghezza: " + clothing.dimensions.length + " cm \n" +
                        "• Larghezza: " + clothing.dimensions.width + " cm \n" +
                        "• Larghezza collo: " + clothing.dimensions.neckWidth + " cm \n" +
                        "• Larghezza maniche: " + clothing.dimensions.sleeveWidth + " cm \n",
                        new[] { new ModalButton() { Text = "OK" } }
                    );
                }
            }

            i++;
        }
    }

    public void torso()
    {
        cam.transform.position = new Vector3(0,1.189f, 2.132f);
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

    public static (bool, string) vest_UMA2(Dictionary<string, DnaSetter> dna, Clothing ca, string sesso_avatar, string[] allergie)
    {
        string motivazione = "";

        //GENERAL CHECK

        string genere_capo = ca.gender.ToString();

        if((sesso_avatar == "MALE" && genere_capo == "FEMALE") || (sesso_avatar == "FEMALE" && genere_capo == "MALE"))
        {
            motivazione = "• Il capo d'abbigliamento non è dello stesso genere del tuo avatar\n\n";
        }

        //ALLERGIES CHECK

        bool x = false;
        string materiale_capo = ca.material.ToString();

        if(!allergie.IsUnityNull())
        {
            foreach(string a in allergie)
            {
                if(a == materiale_capo)
                {
                    x = true;
                }
            }
        }

        string materialNormalized = "";

        switch(materiale_capo)
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

        if(x)
        {
            motivazione = motivazione + "• L'avatar è allergico al materiale del capo d'abbigliamento (" + materialNormalized + ")\n\n";
        }

        //DIMENSIONS CHECK

        float altezza = UMA2_in_cm("ALTEZZA", dna["height"].Get());
        float braccia = UMA2_in_cm("BRACCIA", dna["armWidth"].Get());
        float petto = UMA2_in_cm("PETTO", dna["breastSize"].Get());
        float piedi = UMA2_in_cm("PIEDI", dna["feetSize"].Get());
        float busto = UMA2_in_cm("BUSTO", dna["upperWeight"].Get());
        float glutei = UMA2_in_cm("GLUTEI", dna["gluteusSize"].Get());
        float gambe = UMA2_in_cm("GAMBE", dna["lowerWeight"].Get());
        float bacino = UMA2_in_cm("BACINO", dna["waist"].Get());
        float pancia = UMA2_in_cm("PANCIA", dna["belly"].Get());
        float spalle = UMA2_in_cm("SPALLE", dna["upperMuscle"].Get());

        float lunghezza, larghezza, larghezza_collo, larghezza_maniche;

        bool indossabile = true;

        switch(ca.type.ToString())
        {
            case "T_SHIRT_1":
                lunghezza = ca.dimensions.length;
                larghezza = ca.dimensions.width;
                larghezza_collo = ca.dimensions.neckWidth;
                larghezza_maniche = ca.dimensions.sleeveWidth;

                if(
                    larghezza < petto ||
                    larghezza < busto ||
                    larghezza < bacino ||
                    larghezza < pancia ||
                    larghezza < spalle ||
                    larghezza_maniche < braccia
                )
                {
                    indossabile = false;
                }

                break;
        }

        if(!indossabile)
        {
            motivazione = motivazione + "• L'avatar ha delle dimensioni incompatibili con quelle del capo d'abbigliamento";
        }

        //FINAL CHECK

        if(motivazione == "")
        {
            return (true, motivazione);
        }
        else
        {
            return (false, motivazione);
        }
    }

    public static float UMA2_in_cm(string tipo, float val_UMA2)
    {
        short range_min;
        short range_max;

        short range_min_UMA2 = 0;
        float range_max_UMA2 = 1;

        switch (tipo)
        {
            case "ALTEZZA":
                range_min = 100;
                range_max = 200;

                range_max_UMA2 = 0.5019608f;
                break;

            case "BRACCIA":
                range_min = 10;
                range_max = 15;
                break;

            case "PETTO":
                range_min = 70;
                range_max = 90;
                break;

            case "PIEDI":
                range_min = 20;
                range_max = 25;
                break;

            case "BUSTO":
                range_min = 70;
                range_max = 90;
                break;

            case "GLUTEI":
                range_min = 70;
                range_max = 90;
                break;

            case "GAMBE":
                range_min = 40;
                range_max = 50;
                break;

            case "BACINO":
                range_min = 70;
                range_max = 90;
                break;

            case "PANCIA":
                range_min = 70;
                range_max = 90;
                break;

            case "SPALLE":
                range_min = 30;
                range_max = 50;
                break;

            default:
                return 0;
        }

        float val_cm;

        //FORMULA DI INTERPOLAZIONE LINEARE
        val_cm = (val_UMA2 - range_min_UMA2) * (range_max - range_min) / (range_max_UMA2 - range_min_UMA2) + range_min;

        return val_cm;
    }
}