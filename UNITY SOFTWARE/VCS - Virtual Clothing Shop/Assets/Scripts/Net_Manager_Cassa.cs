using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class Net_Manager_Cassa : MonoBehaviour
{
    void Start()
    {}

    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("Negozio - Entrata");
        }   
    }
}