using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UMA.CharacterSystem;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class Net_Manager_Script : MonoBehaviour
{
    public DynamicCharacterAvatar avatar;
    public TMP_Text nomeNegozioUsato;
    public TMP_Text mailCliente;
    public Button btnCarrello;
    public Button btnImpostazioni;
    public TMP_Text txtQuantita;
    public Animator anim;
    public GameObject avatarPos;
    public static Vector3 pos;
    public static Quaternion rot;

    public Image DarkOverlay;

    public AudioSource audioSource;
    
    void Start()
    {
        AudioListener.volume = PlayerPrefs.GetFloat("musicVolume");

        if(PlayerPrefs.GetInt("VSync") == 1)
        {
            QualitySettings.vSyncCount = 1;
        }
        else
        {
            QualitySettings.vSyncCount = 0;
        }

        if(IsVectorNonZero(pos) && IsQuaternionNonZero(rot))
        {
            avatarPos.gameObject.transform.position = pos;
            avatarPos.gameObject.transform.rotation = rot;
        }
        else
        {
            audioSource.Play();
        }

        nomeNegozioUsato.text = Net_Manager_GetSede.nomeNegozio;
        mailCliente.text = Net_Manager_Login.loggedUser.email;

        string avatarRecipe = net_Manager_GetAvatar.avatarRecipe;

        avatar.LoadFromRecipeString(avatarRecipe);

        if(avatar.activeRace.racedata.ToString().Contains("Human Male"))
        {
            avatar.SetSlot("Chest", "MaleShirt2");
            avatar.SetSlot("Legs", "MaleJeans");
            avatar.SetSlot("Feet", "TallShoes_Black_Recipe");
        }
        else
        {
            avatar.SetSlot("Chest", "FemaleShirt2");
            avatar.SetSlot("Legs", "FemalePants1");
            avatar.SetSlot("Feet", "FemaleTallShoes_Black");
        }

        avatar.BuildCharacter();

        if(PlayerPrefs.HasKey("lum"))
        {
            DarkOverlay.color = new Color(DarkOverlay.color.r, DarkOverlay.color.g, DarkOverlay.color.b, PlayerPrefs.GetFloat("lum"));
        }
    }

    private bool IsVectorNonZero(Vector3 vector)
    {
        return vector.x != 0.0f || vector.y != 0.0f || vector.z != 0.0f;
    }

    private bool IsQuaternionNonZero(Quaternion quaternion)
    {
        return quaternion.x != 0.0f || quaternion.y != 0.0f || quaternion.z != 0.0f || quaternion.w != 0.0f;
    }

    void Update()
    {
        pos = avatarPos.gameObject.transform.position;
        rot = avatarPos.gameObject.transform.rotation;

        if(Input.GetKeyDown(KeyCode.C))
        {
            SceneManager.LoadScene("CartScene");
        }

        if(Input.GetKeyDown(KeyCode.I))
        {
            SceneManager.LoadScene("SettingsScene");
        }

        Cursor.lockState = CursorLockMode.None;

        if(!Net_Manager_Catalogo.quantitaCarrello.IsUnityNull())
        {
            txtQuantita.text = Net_Manager_Catalogo.quantitaCarrello.ToString();
        }
        else
        {
            txtQuantita.text = "0";
        }
    }
}