import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, SceneLoader, Color3, PointLight, WebXRExperienceHelper, WebXREnterExitUI } from "@babylonjs/core";

class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);
        var light = new PointLight("Omni", new Vector3(0, 50, 100), scene);
        var camera = new ArcRotateCamera("Camera", 1, 1, 50, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);


        SceneLoader.AppendAsync("", "scene.babylon", scene).then(result => {
            camera.setTarget(scene.getMeshByName("king_b"));
        });

        // Default Environment
        var environment = scene.createDefaultEnvironment({ enableGroundShadow: true, groundYBias: 2.8 });
        environment.setMainColor(Color3.FromHexString("#74b9ff"));

        // Enable VR
        var vrHelper = scene.createDefaultVRExperience({createDeviceOrientationCamera:false, useXR: true});
        vrHelper.enableTeleportation({floorMeshes: [environment.ground]});

        scene.registerBeforeRender(function () {
            light.position = camera.position;
        })





        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();