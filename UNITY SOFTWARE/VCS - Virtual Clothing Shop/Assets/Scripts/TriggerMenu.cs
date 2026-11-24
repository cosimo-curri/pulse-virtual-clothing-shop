using System;
using System.Collections;
using System.Collections.Generic;
using UMA.CharacterSystem;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.SceneManagement;

public class TriggerMenu : MonoBehaviour
{
    public GameObject testoAvvisoMenu;
    public int scena;
    public AudioSource source;
    public AudioClip[] clipAudio;
    public bool random = true;
    private bool trig = false;
    public GameObject avatar;

    public void Start()
    {
        testoAvvisoMenu.SetActive(false);
    }

    public void Update()
    {
        if(Input.GetKeyDown(KeyCode.X) && trig == true) 
        {
            if(scena == 0)
            {
                Net_Manager_Catalogo.listaCapiCarrello.Clear();
                Net_Manager_Catalogo.quantitaCarrello = 0;

                Net_Manager_Script.pos = Vector3.zero;
                Net_Manager_Script.rot = Quaternion.identity;

                SceneManager.LoadScene("LoginScene");
            }
            if(scena == 13)
            {
                SceneManager.LoadScene("CashierScene");
            }
            if(scena == 12)
            {
                SceneManager.LoadScene("CatalogScene");
            }
            if(scena == 4)
            {
                SceneManager.LoadScene("Camerino - 1");
            }
            if(scena == 7)
            {
                SceneManager.LoadScene("Camerino - 2");
            }
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        trig = true;
        testoAvvisoMenu.SetActive(true);
    }

    private void OnTriggerExit(Collider other)
    {
        trig = false;
        testoAvvisoMenu.SetActive(false);
    }
}