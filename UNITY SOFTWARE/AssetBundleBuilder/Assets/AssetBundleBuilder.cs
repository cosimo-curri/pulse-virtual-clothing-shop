#if UNITY_EDITOR

using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;

public class AssetBundleCreator : MonoBehaviour
{
    [MenuItem ("Assets/Build Asset Bundle")]
    static void BuildBundles()
    {
        // Use the currently selected Editor build target (Windows by default in the original project).
        var target = EditorUserBuildSettings.activeBuildTarget;
        BuildPipeline.BuildAssetBundles("Assets/AssetBundles", BuildAssetBundleOptions.None, target);
    }
}

#endif