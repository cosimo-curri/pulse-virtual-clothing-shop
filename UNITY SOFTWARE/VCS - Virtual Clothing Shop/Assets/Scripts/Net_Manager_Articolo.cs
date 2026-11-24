using Gravitons.UI.Modal;
using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UMA.CharacterSystem;
using UMA;
using UnityEngine;
using UnityEngine.UI;

public class Net_Manager_Articolo : MonoBehaviour
{
    public GameObject lista;
    public TMP_Text txtQuantita;

    void Start()
    {}

    void Update()
    {}

    public void piuQuantita()
    {
        TMP_Text[] t = lista.GetComponentsInChildren<TMP_Text>();

        int n = Convert.ToInt32(t[5].text.ToString());

        if((n + 1) > Convert.ToInt32(txtQuantita.text.ToString()))
        {
            t[5].text = (n).ToString();
        }
        else
        {
            t[5].text = (n + 1).ToString();
        }
    }

    public void menoQuantita()
    {
        TMP_Text[] t = lista.GetComponentsInChildren<TMP_Text>();

        int n = Convert.ToInt32(t[5].text.ToString());

        if((n - 1) < 1)
        {
            t[5].text = 1.ToString();
        }
        else
        {
            t[5].text = (n - 1).ToString();
        }
    }

    public void btnAddCarrello()
    {
        Button[] b = lista.GetComponentsInChildren<Button>();
        TMP_Text[] t = lista.GetComponentsInChildren<TMP_Text>();

        for(int i=0; i<ScriptProgressBar.listaCapiAbbigliamento.Count; i++)
        {
            if(b[2].name.Equals("A" + i))
            {
                bool addResult = Net_Manager_Catalogo.btn_AddCarrello_Main(i, Convert.ToInt32(t[5].text.ToString()));

                if(addResult)
                {
                    Button buttonCart = GameObject.Find("A" + i).GetComponent<Button>();
                    Button buttonMinus = GameObject.Find("M" + i).GetComponent<Button>();
                    Button buttonPlus = GameObject.Find("P" + i).GetComponent<Button>();

                    buttonCart.interactable = false;
                    buttonMinus.interactable = false;
                    buttonPlus.interactable = false;
                }
            }
        }
    }

    public void btnInfo()
    {
        Button[] b = lista.GetComponentsInChildren<Button>();

        for(int i=0; i<ScriptProgressBar.listaCapiAbbigliamento.Count; i++)
        {
            if(b[1].name.Equals("I" + i))
            {
                Net_Manager_Catalogo.btn_info_Main(i);
            }
        }
    }
}