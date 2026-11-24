using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;

public class PhotoScript : MonoBehaviour
{
    public RawImage tshirt;
    public Texture2D frontTexture;
    public Texture2D backTexture;

    public TextMeshProUGUI textAcquisition;

    WebCamTexture webcam;
    public RawImage img;
    bool firstAcquisition = true;

    int width_screen;
    int height_screen;

    Texture2D[] crop_front_back;

    void Start()
    {
        Color tshirtColor = tshirt.color;
        tshirtColor.a = 0.3f;
        tshirt.color = tshirtColor;

        crop_front_back = new Texture2D[2];

        webcam = new WebCamTexture();
        img.texture = webcam;
        webcam.Play();

        height_screen = Screen.width;
        width_screen = webcam.width * height_screen / webcam.height;
        
        //webcam.width x webcam.height → 1440 x 1080
        //487 x 407 → width_tshirt x height_tshirt
        //640 : 487 = 1440 : width_tshirt
        //480 : 407 = 1080 : height_tshirt
        int width_tshirt = 487 * width_screen / webcam.width;
        int height_tshirt = 407 * height_screen / webcam.height;

        img.GetComponent<RectTransform>().sizeDelta = new Vector2(width_screen, height_screen);
        tshirt.GetComponent<RectTransform>().sizeDelta = new Vector2(width_tshirt, height_tshirt);
    }

    void Update()
    {}

    public void SaveImage()
    {
        Handheld.Vibrate();

        Texture2D texture = new Texture2D(img.texture.width, img.texture.height, TextureFormat.ARGB32, false);

        texture.SetPixels(webcam.GetPixels());
        texture.Apply();
        
        if(firstAcquisition)
        {
            crop(Rotate270(texture), true);

            firstAcquisition = false;
            textAcquisition.text = "BACK";

            //webcam.width x webcam.height → 1440 x 1080
            //487 x 376 → width_tshirt x height_tshirt
            //640 : 487 = 1440 : width_tshirt
            //480 : 376 = 1080 : height_tshirt
            int width_tshirt = 487 * width_screen / webcam.width;
            int height_tshirt = 376 * height_screen / webcam.height;

            tshirt.GetComponent<RectTransform>().sizeDelta = new Vector2(width_tshirt, height_tshirt);

            tshirt.texture = backTexture;
        }
        else
        {
            crop(Rotate270(texture), false);
        }
    }

    Texture2D Rotate270(Texture2D orig)
    {
        Color32[] origpix = orig.GetPixels32(0);
        Color32[] newpix = new Color32[orig.width * orig.height];
        int i=0;

        for(int c=0; c<orig.height; c++)
        {
            for(int r=0; r<orig.width; r++)
            {
                newpix[orig.width * orig.height - (orig.height * r + orig.height) + c] = origpix[i];
                i++;
            }
        }

        Texture2D newtex = new Texture2D(orig.height, orig.width, orig.format, false);
        newtex.SetPixels32(newpix, 0);
        newtex.Apply();

        return newtex;
    }
 
    void crop(Texture2D texture, bool front)
    {
        int w;
        int h;
        
        if(front)
        {
            w = 487;
            h = 407;
        }
        else
        {
            w = 487;
            h = 376;
        }

        Texture2D croppedImage = new Texture2D(w, h);

        int width_offset_min = (webcam.height - w) / 2;
        int width_offset_max = width_offset_min + w;
        int height_offset_min = (webcam.width - h) / 2;
        int height_offset_max = height_offset_min + h;

        int row_index = 0;

        for(int i=width_offset_min; i<width_offset_max; i++)
        {
            int col_index = 0;

            for(int j=height_offset_min; j<height_offset_max; j++)
            {
                Color pixelColor = texture.GetPixel(i, j);
                croppedImage.SetPixel(row_index, col_index, pixelColor);

                col_index++;
            }

            row_index++;
        }

        Texture2D shirtImage = new Texture2D(w, h);

        if(front)
            shirtImage = frontTexture;
        else
            shirtImage = backTexture;

        for(int i=0; i<w; i++)
        {
            for(int j=0; j<h; j++)
            {
                Color pixelColor = shirtImage.GetPixel(i, j);

                if(pixelColor == Color.clear)
                    croppedImage.SetPixel(i, j, Color.clear);
            }
        }

        croppedImage.Apply();

        if(front)
            crop_front_back[0] = croppedImage;
        else
        {
            crop_front_back[1] = croppedImage;
            
            int width_uv_map = 1024;
            int height_uv_map = 432;

            Texture2D uv_map = new Texture2D(width_uv_map, height_uv_map);

            for(int i=0; i<1024; i++)
            {
                for(int j=0; j<432; j++)
                {
                    uv_map.SetPixel(i, j, Color.black);
                }
            }

            for(int i=0; i<487; i++)
            {
                for(int j=0; j<407; j++)
                {
                    Color pixelColor = crop_front_back[0].GetPixel(i, j);

                    if(pixelColor == Color.clear)
                        uv_map.SetPixel(i + 12, j + 10, Color.black);
                    else
                        uv_map.SetPixel(i + 12, j + 10, pixelColor);
                }
            }

            for(int i=0; i<487; i++)
            {
                for(int j=0; j<376; j++)
                {
                    Color pixelColor = crop_front_back[1].GetPixel(i, j);

                    if(pixelColor == Color.clear)
                        uv_map.SetPixel(i + 524, j + 44, Color.black);
                    else
                        uv_map.SetPixel(i + 524, j + 44, pixelColor);
                }
            }

            uv_map.Apply();
            StaticObjects.texture_uv_map = uv_map;
            SceneManager.LoadScene("AvatarScene");
        }
    }
}