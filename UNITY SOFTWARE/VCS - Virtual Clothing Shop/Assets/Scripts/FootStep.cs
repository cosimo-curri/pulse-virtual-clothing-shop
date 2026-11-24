using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FootStep : MonoBehaviour
{
    public AudioSource source;
    public AudioClip[] foot_step;

    public void footSound()
    {
        source.clip = foot_step[Random.Range(0, foot_step.Length)];
        source.PlayOneShot(source.clip);
    }

    void Start()
    {}

    void Update()
    {}
}