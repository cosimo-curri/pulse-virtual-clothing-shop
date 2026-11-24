using System.Collections;
using System.Collections.Generic;
using Unity.VisualScripting;
using UnityEngine;

public class TriggerBenvenuto : MonoBehaviour
{
    public AudioSource audioBenvenuto;
    public AudioClip clip;

    private void OnTriggerEnter(Collider other)
    {
        if(other.tag == "Player")
        {
            audioBenvenuto.clip = clip;
            audioBenvenuto.Play();
        }
    }

    private void OnTriggerExit(Collider other)
    {
        Destroy(gameObject);
    }
}