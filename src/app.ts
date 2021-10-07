import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, SceneLoader, PointLight } from "@babylonjs/core";

class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        let elem = document.documentElement;

        elem.requestFullscreen({ navigationUI: "show" }).then(() => { }).catch(err => {
            alert(`An error occurred while trying to switch into full-screen mode: ${err.message} (${err.name})`);
        });

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);
        var light = new PointLight("Omni", new Vector3(0, 50, 100), scene);
        var camera = new ArcRotateCamera("Camera", 1, 1, 50, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);


        SceneLoader.AppendAsync("", "scene.babylon", scene).then(result => {
            const kb = scene.getMeshByName("king_b");
            camera.setTarget(kb);
        })


        scene.registerBeforeRender(function () {
            light.position = camera.position;
        });

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();