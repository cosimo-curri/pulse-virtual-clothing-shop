using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class Net_Manager_Articolo_Carrello : MonoBehaviour
{
    public GameObject lista;
    public TMP_Text txtQuantita;

    void Start()
    {
        TMP_Text[] t = lista.GetComponentsInChildren<TMP_Text>();
        t[5].text = txtQuantita.text.ToString();
    }

    void Update()
    {}

    public void piuQuantita()
    {
        TMP_Text[] t = lista.GetComponentsInChildren<TMP_Text>();
        int n = Convert.ToInt32(t[5].text.ToString());

        for(int i=0; i<Net_Manager_Catalogo.listaCapiCarrello.Count; i++)
        {
            if(t[5].name.Equals("Q" + i))
            {
                int count = 0;

                foreach(Clothing clothing in ScriptProgressBar.listaCapiAbbigliamento)
                {
                    if(i == count)
                    {
                        if((n + 1) > Net_Manager_Carrello.clothingMaxQuantityReferences[i])
                        {
                            t[5].text = (n).ToString();
                        }
                        else
                        {
                            t[5].text = (n + 1).ToString();
                        }
                    }

                    count++;
                }
            }
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

    public void btnAggiorna()
    {
        TMP_Text[] t = lista.GetComponentsInChildren<TMP_Text>();
        int n = Convert.ToInt32(t[5].text.ToString());

        if(Convert.ToInt32(txtQuantita.text.ToString()) < n)
        {
            int diff = Convert.ToInt32(txtQuantita.text.ToString()) - n;
            Net_Manager_Catalogo.quantitaCarrello = Net_Manager_Catalogo.quantitaCarrello - diff;
        }
        else if(Convert.ToInt32(txtQuantita.text.ToString()) > n)
        {
            int diff = n - Convert.ToInt32(txtQuantita.text.ToString());
            Net_Manager_Catalogo.quantitaCarrello = Net_Manager_Catalogo.quantitaCarrello + diff;
        }

        txtQuantita.text = t[5].text.ToString();

        for(int i=0; i<ScriptProgressBar.listaCapiAbbigliamento.Count; i++)
        {
            if(t[5].name.Equals("Q" + i))
            {
                int count = 0;

                foreach(Clothing clothing in Net_Manager_Catalogo.listaCapiCarrello)
                {
                    if(i == count)
                    {
                        Net_Manager_Carrello.prezzoTotale = Net_Manager_Carrello.prezzoTotale - (clothing.price * clothing.cartQuantity);
                        clothing.cartQuantity = (short) Convert.ToInt32(t[5].text.ToString());
                        Net_Manager_Carrello.prezzoTotale = Net_Manager_Carrello.prezzoTotale + (clothing.price * clothing.cartQuantity);
                    }

                    count++;
                }
            }
        }
    }

    public void btnRimuovi()
    {
        Button[] b = lista.GetComponentsInChildren<Button>();

        for(int i=0; i<ScriptProgressBar.listaCapiAbbigliamento.Count; i++)
        {
            if(b[1].name.Equals("I" + i))
            {
                int count = 0;

                foreach(Clothing clothing in Net_Manager_Catalogo.listaCapiCarrello)
                {
                    if(i == count)
                    {
                        Net_Manager_Catalogo.quantitaCarrello = Net_Manager_Catalogo.quantitaCarrello - clothing.cartQuantity;
                        Net_Manager_Catalogo.listaCapiCarrello.Remove(clothing);

                        break;
                    }

                    count++;
                }

                SceneManager.LoadScene("CartScene");
            }
        }
    }
}