using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Rotazione_Avatar : MonoBehaviour
{
    public GameObject avatar;
    public GameObject supporto;
    public Slider slider;

    public void OnSliderChanged()
    {
        supporto.transform.localEulerAngles = new Vector3(-90, 0, slider.value);
        avatar.transform.localEulerAngles = new Vector3(0, slider.value, 0);
    }
}