using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class HomeScript : MonoBehaviour
{
    public Animator transitionAnimation;

    void Start()
    {
        StartCoroutine(LoadScene());
    }

    void Update()
    {}

    IEnumerator LoadScene()
    {
        transitionAnimation.SetTrigger("End");
        yield return new WaitForSeconds(2.3f);
        SceneManager.LoadScene("LoginScene");
    }
}