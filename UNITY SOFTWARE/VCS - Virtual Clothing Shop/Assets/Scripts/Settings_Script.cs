using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;

public class Settings_Script : MonoBehaviour
{
    public Toggle fullscreen, vsync;
    public TMP_Text lblGraphicQuality;

    public Slider Volume;
    public Slider Lum;

    void Start()
    {
        switch(QualitySettings.GetQualityLevel())
        {
            case 0:
                lblGraphicQuality.text = "Qualità grafica (BASSA)";
                break;

            case 1:
                lblGraphicQuality.text = "Qualità grafica (MEDIA)";
                break;

            case 2:
                lblGraphicQuality.text = "Qualità grafica (ALTA)";
                break;
        }

        if(PlayerPrefs.GetInt("VSync") == 1)
        {
            vsync.isOn = true;
        }
        else
        {
            vsync.isOn = false;
        }

        if(Screen.fullScreenMode == FullScreenMode.ExclusiveFullScreen)
        {
            fullscreen.isOn = true;
        }
        else
        {
            fullscreen.isOn = false;
        }

        if(!PlayerPrefs.HasKey("musicVolume"))
        {
            PlayerPrefs.SetFloat("musicVolume", 1);
        }

        Volume.value = PlayerPrefs.GetFloat("musicVolume");

        if(!PlayerPrefs.HasKey("lum"))
        {
            PlayerPrefs.SetFloat("lum", 0);
        }

        Lum.value = PlayerPrefs.GetFloat("lum");
    }

    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Escape))
        {
            SceneManager.LoadScene("Negozio - Entrata");
        }
    }

    public void ExitVCS()
    {
        Application.Quit();
    }

    public void applyHighQuality()
    {
        QualitySettings.SetQualityLevel(2);
        lblGraphicQuality.text = "Qualità grafica (ALTA)";
    }

    public void applyMidQuality()
    {
        QualitySettings.SetQualityLevel(1);
        lblGraphicQuality.text = "Qualità grafica (MEDIA)";
    }

    public void applyLowQuality()
    {
        QualitySettings.SetQualityLevel(0);
        lblGraphicQuality.text = "Qualità grafica (BASSA)";
    }

    public void applyVSync()
    {
        if(vsync.isOn)
        {
            PlayerPrefs.SetInt("VSync", 1);
        }
        else
        {
            PlayerPrefs.SetInt("VSync", 0);
        }
    }

    public void applyFullscreen()
    {
        if(fullscreen.isOn)
        {
            Screen.fullScreenMode = FullScreenMode.ExclusiveFullScreen;
        }
        else
        {
            Screen.fullScreenMode = FullScreenMode.Windowed;
        }
    }

    public void setVolume()
    {
        AudioListener.volume = Volume.value;
        PlayerPrefs.SetFloat("musicVolume", Volume.value);
    }

    public void setLum() {
        PlayerPrefs.SetFloat("lum", Lum.value);
    }
}