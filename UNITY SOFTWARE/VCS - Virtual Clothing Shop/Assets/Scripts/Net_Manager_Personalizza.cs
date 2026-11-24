using System.Collections;
using System.Collections.Generic;
using TMPro;
using UMA;
using UMA.CharacterSystem;
using UnityEngine;
using System.Linq;
using UnityEngine.UI;
using System;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using System.Text;
using Unity.VisualScripting;
using Gravitons.UI.Modal;
using Newtonsoft.Json;

public class Net_Manager_Personalizza : MonoBehaviour
{
    public TMP_InputField nomeAvatar;
    public TMP_Dropdown menuSesso;
    public TMP_Dropdown menuSkin;
    public TMP_Dropdown menuCapelliM;
    public TMP_Dropdown menuCapelliF;
    public TMP_Dropdown menuColoreCapelli;
    public TMP_Dropdown menuBarbaM;
    public TMP_Dropdown menuBarbaF;
    public TMP_Dropdown menuColoreBarba;
    public TMP_Dropdown menuOcchi;
    public TMP_Dropdown menuAllergie;
    public ToggleGroup scelta_menu;
    public GameObject menu_generale;
    public GameObject menu_proporzioni;
    public DynamicCharacterAvatar avatar;
    public Slider altezzaSlider;
    public Slider bracciaSlider;
    public Slider pettoSlider;
    public Slider piediSlider;
    public Slider bustoSlider;
    public Slider gluteiSider;
    public Slider gambeSlider;
    public Slider bacinoSlider;
    public Slider panciaSlider;
    public Slider spalleSlider;

    public bool cotone = false;
    public bool pelle = false;
    public bool gomma = false;
    public bool poliestere = false;
    public bool velluto = false;
    public bool lana = false;

    public short IntMenuAllergie = 1;

    public TMP_Text txtAltezza;
    public TMP_Text txtBraccia;
    public TMP_Text txtPetto;
    public TMP_Text txtPiedi;
    public TMP_Text txtBusto;
    public TMP_Text txtGlutei;
    public TMP_Text txtGambe;
    public TMP_Text txtBacino;
    public TMP_Text txtPancia;
    public TMP_Text txtSpalle;

    public List<string> hairModels = new List<string>();
    public List<string> beardModels = new List<string>();
    public List<string> sopraccigliaModels = new List<string>();

    private Dictionary<string, DnaSetter> dna;

    private void OnEnable()
    {
        avatar.CharacterUpdated.AddListener(Updated);
        altezzaSlider.onValueChanged.AddListener(changeAltezza);
        bacinoSlider.onValueChanged.AddListener(changeBacino);
        panciaSlider.onValueChanged.AddListener(changePancia);
        bracciaSlider.onValueChanged.AddListener(changeBraccia);
        pettoSlider.onValueChanged.AddListener(changePetto);
        piediSlider.onValueChanged.AddListener(changePiedi);
        bustoSlider.onValueChanged.AddListener(changeBusto);
        gluteiSider.onValueChanged.AddListener(changeGlutei);
        gambeSlider.onValueChanged.AddListener(changeGambe);
        spalleSlider.onValueChanged.AddListener(changeSpalle);
    }

    private void OnDisable()
    {
        avatar.CharacterUpdated.RemoveListener(Updated);
        altezzaSlider.onValueChanged.RemoveListener(changeAltezza);
        bacinoSlider.onValueChanged.RemoveListener(changeBacino);
        panciaSlider.onValueChanged.RemoveListener(changePancia);
        bracciaSlider.onValueChanged.RemoveListener(changeBraccia);
        pettoSlider.onValueChanged.RemoveListener(changePetto);
        piediSlider.onValueChanged.RemoveListener(changePiedi);
        bustoSlider.onValueChanged.RemoveListener(changeBusto);
        gluteiSider.onValueChanged.RemoveListener(changeGlutei);
        gambeSlider.onValueChanged.RemoveListener(changeGambe);
        spalleSlider.onValueChanged.RemoveListener(changeSpalle);
    }

    void Updated(UMAData data)
    {
        dna = avatar.GetDNA();
    }

    public void changeSpalle(float val)
    {
        dna["upperMuscle"].Set(val);
        avatar.BuildCharacter();
    }

    public void changeGambe(float val)
    {
        dna["lowerWeight"].Set(val);
        avatar.BuildCharacter();
    }

    public void changeGlutei(float val)
    {
        dna["gluteusSize"].Set(val);
        avatar.BuildCharacter();
    }

    public void changeAltezza(float val)
    {
        dna["height"].Set(val);
        avatar.BuildCharacter();
    }

    public void changeBusto(float val)
    {
        dna["upperWeight"].Set(val);
        avatar.BuildCharacter();
    }

    public void changePiedi(float val)
    {
        dna["feetSize"].Set(val);
        avatar.BuildCharacter();
    }

    public void changePetto(float val)
    {
        dna["breastSize"].Set(val);
        avatar.BuildCharacter();
    }

    public void changeBraccia(float val)
    {
        dna["armWidth"].Set(val);
        dna["forearmWidth"].Set(val);
        avatar.BuildCharacter();
    }

    public void changeBacino(float val)
    {
        dna["waist"].Set(val);
        avatar.BuildCharacter();
    }

    public void changePancia(float val)
    {
        dna["belly"].Set(val);
        avatar.BuildCharacter();
    }

    public void changeSesso(int val)
    {
        switch(val) {
            case 0:
                avatar.ChangeRace("HumanMale");
                break;
            
            case 1:
                avatar.ChangeRace("HumanFemale");
                break;
        }
    }

    public void changeSkin(int val)
    {
        switch(val) {
            case 0:
                avatar.SetColor("Skin", Color.white);
                break;
            
            case 1:
                avatar.SetColor("Skin", Color.grey);
                break;

            case 2:
                avatar.SetColor("Skin", Color.black);
                break;
        }
        
        avatar.UpdateColors(true);
    }

    public void changeOcchi(int val)
    {
        switch(val) {
            case 0:
                avatar.SetColor("Eyes", Color.black);
                break;
            
            case 1:
                avatar.SetColor("Eyes", Color.blue);
                break;

            case 2:
                avatar.SetColor("Eyes", Color.green);
                break;
        }

        avatar.UpdateColors(true);
    }

    public void changeColoreCapelli(int val)
    {
        switch(val) {
            case 0:
                avatar.SetColor("Hair", Color.black);
                menuColoreBarba.value = 0;
                break;
            
            case 1:
                avatar.SetColor("Hair", Color.grey);
                menuColoreBarba.value = 1;
                break;
            
            case 2:
                avatar.SetColor("Hair", Color.yellow);
                menuColoreBarba.value = 2;
                break;

            case 3:
                avatar.SetColor("Hair", Color.red);
                menuColoreBarba.value = 3;
                break;
        }

        avatar.UpdateColors(true);
    }

    public void changeColoreBarba(int val)
    {
        switch(val) {
            case 0:
                avatar.SetColor("Hair", Color.black);
                menuColoreCapelli.value = 0;
                break;
            
            case 1:
                avatar.SetColor("Hair", Color.grey);
                menuColoreCapelli.value = 1;
                break;
            
            case 2:
                avatar.SetColor("Hair", Color.yellow);
                menuColoreCapelli.value = 2;
                break;

            case 3:
                avatar.SetColor("hair", Color.red);
                menuColoreCapelli.value = 3;
                break;
        }

        avatar.UpdateColors(true);
    }

    public void changeHairModel(int val)
    {
        if(menuSesso.value == 0)
        {
            if(val == 0)
            {
                avatar.ClearSlot("Hair");
            }
            else if(val > 0 && val < 4)
            {
                avatar.SetSlot("Hair", hairModels[val]);
            }

            avatar.BuildCharacter();
        }

        if(menuSesso.value == 1)
        {
            if(val == 0)
            {
                avatar.ClearSlot("Hair");
            }
            else if(val > 0 && val < 4)
            {
                avatar.SetSlot("Hair", hairModels[val + 3]);
            }

            avatar.BuildCharacter();
        }
    }

    public void changeBeardModel(int val)
    {
        if(menuSesso.value == 0)
        {
            if(val == 0)
            {
                avatar.ClearSlot("Beard");
            }
            else if(val > 0 && val < 4)
            {
                avatar.SetSlot("Beard", beardModels[val]);
            }

            avatar.BuildCharacter();
        }

        if(menuSesso.value == 1)
        {
            if(val == 0)
            {
                avatar.ClearSlot("Beard");
            }

            avatar.BuildCharacter();
        }
    }

    public Toggle currentSelection
    {
        get { return scelta_menu.ActiveToggles().FirstOrDefault(); }
    }

    void Start()
    {
        menuSesso.value = 0;
        menuSkin.value = 0;
        menuCapelliM.value = 0;
        menuCapelliF.value = 0;
        menuColoreCapelli.value = 0;
        menuColoreBarba.value = 0;
        menuOcchi.value = 0;

        avatar.ChangeRace("HumanMale");

        avatar.ClearSlot("Hair");

        avatar.SetColor("Skin", Color.white);
        avatar.SetColor("Hair", Color.black);
        avatar.SetColor("Eyes", Color.black);
        avatar.UpdateColors(true);

        avatar.BuildCharacter();
    }

    void Update()
    {
        if(menuSesso.value == 0)
        {
            menuBarbaM.gameObject.SetActive(true);
            menuBarbaF.gameObject.SetActive(false);
            menuCapelliM.gameObject.SetActive(true);
            menuCapelliF.gameObject.SetActive(false);
        }
        else if(menuSesso.value == 1)
        {
            menuBarbaM.gameObject.SetActive(false);
            menuBarbaF.gameObject.SetActive(true);
            menuCapelliM.gameObject.SetActive(false);
            menuCapelliF.gameObject.SetActive(true);
        }

        if(currentSelection.name.Equals("Generale"))
        {
            menu_generale.SetActive(true);
            menu_proporzioni.SetActive(false);
        }
        else
        {
            menu_generale.SetActive(false);
            menu_proporzioni.SetActive(true);
        }

        try
        {
            preleva_toggle_allergie();
        }
        catch(Exception)
        {
            IntMenuAllergie = 1;
        }

        txtAltezza.text = UMA2_in_cm("ALTEZZA", dna["height"].Get()) + " cm";
        txtBraccia.text = UMA2_in_cm("BRACCIA", dna["armWidth"].Get()) + " cm";
        txtPetto.text = UMA2_in_cm("PETTO", dna["breastSize"].Get()) + " cm";
        txtPiedi.text = UMA2_in_cm("PIEDI", dna["feetSize"].Get()) + " cm";
        txtBusto.text = UMA2_in_cm("BUSTO", dna["upperWeight"].Get()) + " cm";
        txtGlutei.text = UMA2_in_cm("GLUTEI", dna["gluteusSize"].Get()) + " cm";
        txtGambe.text = UMA2_in_cm("GAMBE", dna["lowerWeight"].Get()) + " cm";
        txtBacino.text = UMA2_in_cm("BACINO", dna["waist"].Get()) + " cm";
        txtPancia.text = UMA2_in_cm("PANCIA", dna["belly"].Get()) + " cm";
        txtSpalle.text = UMA2_in_cm("SPALLE", dna["upperMuscle"].Get()) + " cm";

        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("ChooseAvatarScene");
        }
    }

    private void preleva_toggle_allergie()
    {
        Toggle Cotone = menuAllergie.transform.Find("Dropdown List").gameObject.transform.Find("Viewport").gameObject.transform.Find("Content").gameObject.transform.Find("Item 0: Seleziona").gameObject.transform.Find("Cotone").GetComponent<Toggle>();
        Toggle Pelle = menuAllergie.transform.Find("Dropdown List").gameObject.transform.Find("Viewport").gameObject.transform.Find("Content").gameObject.transform.Find("Item 0: Seleziona").gameObject.transform.Find("Pelle").GetComponent<Toggle>();
        Toggle Gomma = menuAllergie.transform.Find("Dropdown List").gameObject.transform.Find("Viewport").gameObject.transform.Find("Content").gameObject.transform.Find("Item 0: Seleziona").gameObject.transform.Find("Gomma").GetComponent<Toggle>();
        Toggle Poliestere = menuAllergie.transform.Find("Dropdown List").gameObject.transform.Find("Viewport").gameObject.transform.Find("Content").gameObject.transform.Find("Item 0: Seleziona").gameObject.transform.Find("Poliestere").GetComponent<Toggle>();
        Toggle Velluto = menuAllergie.transform.Find("Dropdown List").gameObject.transform.Find("Viewport").gameObject.transform.Find("Content").gameObject.transform.Find("Item 0: Seleziona").gameObject.transform.Find("Velluto").GetComponent<Toggle>();
        Toggle Lana = menuAllergie.transform.Find("Dropdown List").gameObject.transform.Find("Viewport").gameObject.transform.Find("Content").gameObject.transform.Find("Item 0: Seleziona").gameObject.transform.Find("Lana").GetComponent<Toggle>();

        if(IntMenuAllergie == 1)
        {
            if(cotone)
            {
                Cotone.isOn = true;
            }

            if(pelle)
            {
                Pelle.isOn = true;
            }

            if(gomma)
            {
                Gomma.isOn = true;
            }

            if(poliestere)
            {
                Poliestere.isOn = true;
            }

            if(velluto)
            {
                Velluto.isOn = true;
            }

            if(lana)
            {
                Lana.isOn = true;
            }

            IntMenuAllergie = 0;
        }

        if(Cotone.isOn)
        {
            cotone = true;
        }
        else
        {
            cotone = false;
        }

        if(Pelle.isOn)
        {
            pelle = true;
        }
        else
        {
            pelle = false;
        }

        if(Gomma.isOn)
        {
            gomma = true;
        }
        else
        {
            gomma = false;
        }

        if(Poliestere.isOn)
        {
            poliestere = true;
        }
        else
        {
            poliestere = false;
        }

        if(Velluto.isOn)
        {
            velluto = true;
        }
        else
        {
            velluto = false;
        }

        if(Lana.isOn)
        {
            lana = true;
        }
        else
        {
            lana = false;
        }
    }

    public static string Base64Encode(string plainText)
    {
        var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
        return System.Convert.ToBase64String(plainTextBytes);
    }

    public float UMA2_in_cm(string tipo, float val_UMA2)
    {
        short range_min;
        short range_max;

        float range_min_UMA2 = 0;
        float range_max_UMA2 = 1;

        switch(tipo)
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

                range_min_UMA2 = 0.42f;
                range_max_UMA2 = 0.57f;
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

        return ((short) val_cm);
    }

    public void creaAvatar()
    {
        string nome = nomeAvatar.text.ToString();

        if(nome != "")
        {
            string avatar_recipe = avatar.GetCurrentRecipe();
            avatar_recipe = Base64Encode(avatar_recipe);
            
            LinkedList<string> allergies = new LinkedList<string>();

            if(cotone)
            {
                allergies.AddLast("COTTON");
            }

            if(gomma)
            {
                allergies.AddLast("RUBBER");
            }

            if(pelle)
            {
                allergies.AddLast("LEATHER");
            }

            if(poliestere)
            {
                allergies.AddLast("POLYESTER");
            }

            if(velluto)
            {
                allergies.AddLast("VELVET");
            }

            if(lana)
            {
                allergies.AddLast("WOOL");
            }

            string stringAllergies = "[";
            bool firstAllergy = true;

            foreach(string allergy in allergies)
            {
                if(firstAllergy)
                {
                    stringAllergies += "\"" + allergy + "\"";
                    firstAllergy = false;
                }
                else
                {
                    stringAllergies += ", \"" + allergy + "\"";
                }
            }

            stringAllergies += "]";

            string url = ListAPI_Script.createAvatar;
            string bodyJsonString = "{ \"name\": \"" + nome + "\", \"avatarRecipe\": \"" + avatar_recipe + "\", \"allergies\": " + stringAllergies + " }";

            StartCoroutine(Post(url, bodyJsonString));
        }
        else
        {
            ModalManager.Show("ATTENZIONE", "Non hai inserito alcun nome", new[] { new ModalButton() { Text = "OK" } });
        }
    }

    IEnumerator Post(string url, string bodyJsonString)
    {
        var request = new UnityWebRequest(url, "POST");

        byte[] bodyRaw = Encoding.UTF8.GetBytes(bodyJsonString);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("token", Net_Manager_Login.loggedUser.currentValidToken);
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();
        
        if(request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError)
        {
            SceneManager.LoadScene("LoginScene");
        }
        else
        {
            string responseData = request.downloadHandler.text;
            
            AvatarCreationServerResponse avatarCreationServerResponse = JsonUtility.FromJson<AvatarCreationServerResponse>(responseData);

            switch(avatarCreationServerResponse.message)
            {
                case "TOKEN_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN":
                case "USER_NOT_LOGGED":
                case "CREATE_AVATAR_ERROR":
                    SceneManager.LoadScene("LoginScene");
                    break;

                case "CREATE_AVATAR_OK":
                    SceneManager.LoadScene("ChooseAvatarScene");
                    break;
            }
        }
    }

    public void HumanAcquisitionURL()
    {
        Application.OpenURL(ListAPI_Script.HUMAN_ACQUISITION_URL);
    }
}

[System.Serializable]
public class AvatarCreationServerResponse
{
    public string message;
}