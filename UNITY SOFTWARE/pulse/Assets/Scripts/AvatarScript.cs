using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UMA;
using UMA.CharacterSystem;
using TMPro;
using System.IO;
using UnityEngine.SceneManagement;

public class AvatarScript : MonoBehaviour
{
    private bool sceneInteractable = false;

    public Transform transformCylinder;
    public Animator animatorCylinder;

    public DynamicCharacterAvatar avatar;

    private Vector2 startPosition;
    private bool isSwiping = false;
    public float rotationSpeed = 7.0f;

    private bool defaultShirt = true;
    private Texture2D newTexture;
    public TextMeshProUGUI btnChangeText;
    public OverlayDataAsset tshirtOverlay;
    public Texture2D defaultTexture;

    public Button btnChange;
    public Button btnAssetBundle;

    void Start()
    {
        if(StaticObjects.texture_uv_map == null)
            newTexture = defaultTexture;
        else
            newTexture = StaticObjects.texture_uv_map;
        
        btnChange.interactable = false;
        btnAssetBundle.interactable = false;

        StartCoroutine(MakeSceneInteractable());
    }

    void Update()
    {}

    void LateUpdate()
    {
        if(Input.touchCount > 0 && sceneInteractable)
        {
            Touch touch = Input.GetTouch(0);

            switch(touch.phase)
            {
                case TouchPhase.Began:
                    startPosition = touch.position;
                    isSwiping = true;
                    break;

                case TouchPhase.Moved:
                    if(isSwiping)
                    {
                        float swipeDeltaX = touch.position.x - startPosition.x;
                        transformCylinder.Rotate(Vector3.up, -swipeDeltaX * rotationSpeed * Time.deltaTime, Space.World);
                        startPosition = touch.position;
                    }

                    break;

                case TouchPhase.Ended:
                    isSwiping = false;
                    break;
            }
        }
    }

    IEnumerator MakeSceneInteractable()
    {
        yield return new WaitForSeconds(2.6f);
        btnChange.interactable = true;
        animatorCylinder.enabled = false;
        sceneInteractable = true;
    }

    public void ChangeTexture()
    {
        if(defaultShirt)
        {
            tshirtOverlay.textureList[0] = newTexture;
            btnChangeText.text = "Reset";
        }
        else
        {
            tshirtOverlay.textureList[0] = defaultTexture;
            btnChangeText.text = "Apply t-shirt";
        }

        avatar.BuildCharacter();

        defaultShirt = !defaultShirt;

        if(newTexture == defaultTexture)
            btnAssetBundle.interactable = false;
        else
            btnAssetBundle.interactable = !btnAssetBundle.interactable;
    }

    public void ExportTexture()
    {
        SceneManager.LoadScene("CreateClothingScene");
    }
}