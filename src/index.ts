import * as BABYLON from 'babylonjs';
import * as BABYLONGUI from 'babylonjs-gui';
import * as CANNON from 'cannon';

window.CANNON = CANNON;

class UiController {
    leftPower: number;
    rightPower: number;

    constructor() {
        var powerGroup = new BABYLONGUI.SliderGroup("Power (press spacebar to apply)");
        powerGroup.addSlider("Left", (v:number) : void => {this.leftPower = Math.floor(v)}, "%", -100, 100, 0, (v:number) : number => {return Math.floor(v)});
        powerGroup.addSlider("Right", (v:number) : void => {this.rightPower = Math.floor(v)}, "%", -100, 100, 0, (v:number) : number => {return Math.floor(v)});
    
        var selectBox = new BABYLONGUI.SelectionPanel("panel");
        selectBox.width = 0.25;
        selectBox.height = 0.30;
        selectBox.background = "#1388AF";
        selectBox.horizontalAlignment = BABYLONGUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        selectBox.verticalAlignment = BABYLONGUI.Control.VERTICAL_ALIGNMENT_TOP;
        selectBox.addGroup(powerGroup);
        
        var advancedTexture = BABYLONGUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.addControl(selectBox);
    }
}

class Robot {
    body: BABYLON.Mesh;

    frontLeftWheel: BABYLON.Mesh;
    frontRightWheel: BABYLON.Mesh;
    rearLeftWheel: BABYLON.Mesh;
    rearRightWheel: BABYLON.Mesh;

    frontLeftWheelJoint: BABYLON.HingeJoint;
    frontRightWheelJoint: BABYLON.HingeJoint;
    rearLeftWheelJoint: BABYLON.HingeJoint;
    rearRightWheelJoint: BABYLON.HingeJoint;

    static readonly frontLeftWheelPosition = new BABYLON.Vector3(3, -0.5, 3);
    static readonly frontRightWheelPosition = new BABYLON.Vector3(3, -0.5, -3);
    static readonly rearLeftWheelPosition = new BABYLON.Vector3(-3, -0.5, 3);
    static readonly rearRightWheelPosition = new BABYLON.Vector3(-3, -0.5, -3);

    constructor(scene: BABYLON.Scene, startPosition: BABYLON.Vector3) {
        this.body = this.createBody(scene);

        this.frontLeftWheel = this.createWheel(Robot.frontLeftWheelPosition, scene, 1000);
        this.frontLeftWheelJoint = this.createHingeJoint(Robot.frontLeftWheelPosition);
        this.body.physicsImpostor.addJoint(this.frontLeftWheel.physicsImpostor, this.frontLeftWheelJoint);
        this.body.addChild(this.frontLeftWheel);

        this.frontRightWheel = this.createWheel(Robot.frontRightWheelPosition, scene, 1000);
        this.frontRightWheelJoint = this.createHingeJoint(Robot.frontRightWheelPosition);
        this.body.physicsImpostor.addJoint(this.frontRightWheel.physicsImpostor, this.frontRightWheelJoint);
        this.body.addChild(this.frontRightWheel);

        this.rearLeftWheel = this.createWheel(Robot.rearLeftWheelPosition, scene, 0);
        this.rearLeftWheelJoint = this.createHingeJoint(Robot.rearLeftWheelPosition);
        this.body.physicsImpostor.addJoint(this.rearLeftWheel.physicsImpostor, this.rearLeftWheelJoint);
        this.body.addChild(this.rearLeftWheel);

        this.rearRightWheel = this.createWheel(Robot.rearRightWheelPosition, scene, 0);
        this.rearRightWheelJoint = this.createHingeJoint(Robot.rearRightWheelPosition);
        this.body.physicsImpostor.addJoint(this.rearRightWheel.physicsImpostor, this.rearRightWheelJoint);
        this.body.addChild(this.rearRightWheel);

        this.body.position = startPosition;
    }

    // -100 <= force <= 100
    powerLeft(force: number): void {
        this.frontLeftWheelJoint.setMotor(force, 100);
    }

    // -100 <= force <= 100
    powerRight(force: number): void {
        this.frontRightWheelJoint.setMotor(force, 100);
    }

    createBody(scene: BABYLON.Scene): BABYLON.Mesh {
        var bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", scene);
        bodyMaterial.diffuseColor = BABYLON.Color3.Red();
        var body = BABYLON.MeshBuilder.CreateBox("robotBody", {width: 6, depth: 6, height: 1}, scene);
        body.material = bodyMaterial;
        body.physicsImpostor = new BABYLON.PhysicsImpostor(
                                            body,
                                            BABYLON.PhysicsImpostor.BoxImpostor,
                                            { mass: 100, restitution: 0 },
                                            scene);

        var head = BABYLON.MeshBuilder.CreateSphere("head", {diameter: 4}, scene);
        head.position = new BABYLON.Vector3(0, 2, 0);
        body.addChild(head);
       
        var nose = BABYLON.MeshBuilder.CreateCylinder("head", {height: 3, diameterTop: 3, diameterBottom: 0}, scene);
        nose.position = new BABYLON.Vector3(2, 2, 0);
        nose.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
        body.addChild(nose);

        return body;
    }

    createWheel(position: BABYLON.Vector3, scene: BABYLON.Scene, friction: number): BABYLON.Mesh {
        var wheelMaterial = new BABYLON.StandardMaterial("wheel", scene);
        wheelMaterial.diffuseTexture = new BABYLON.Texture("images/amiga.png", scene);
        var wheel = BABYLON.MeshBuilder.CreateSphere("wheel", {diameter: 2}, scene);
        wheel.position = position;
        wheel.material = wheelMaterial;
        wheel.physicsImpostor = new BABYLON.PhysicsImpostor(
            wheel, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5, restitution: 0, friction: friction }, scene);

        return wheel;
    }

    createHingeJoint(position: BABYLON.Vector3): BABYLON.HingeJoint {
        var joint = new BABYLON.HingeJoint({
            mainPivot: position, // wheel rotates around this point
            connectedPivot: new BABYLON.Vector3(0, 0, 0), // vector center of wheel -> mainPivot
            mainAxis: new BABYLON.Vector3(0, 0, 1),
            connectedAxis: new BABYLON.Vector3(0, 0, 1),
        }); 

        return joint;
    }
}


function createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {

    var scene = new BABYLON.Scene(engine);
    var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 3, 50, BABYLON.Vector3.Zero(), scene);
	camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var box = BABYLON.MeshBuilder.CreateBox("box", {width: 3, depth: 3, height: 5}, scene);
    box.position.y = 10;
    var boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = BABYLON.Color3.Magenta();
    box.material = boxMaterial;
	box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 50, restitution: 0.5 }, scene);

    var robot = new Robot(scene, new BABYLON.Vector3(-10, 8, 6));

    var ground = BABYLON.Mesh.CreateGround("ground1", 80, 80, 2, scene);
	ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.2, restitution: 0 }, scene);

    var uiController = new UiController();

    // Keyboard events
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {	
        if (evt.sourceEvent.key == ' ') {
            robot.powerLeft(uiController.leftPower);
            robot.powerRight(uiController.rightPower);
        }
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        if (evt.sourceEvent.key == ' ') {
            robot.powerLeft(0);
            robot.powerRight(0);
        }        
    }));
        
    return scene;
};

var canvas: any = document.getElementById("renderCanvas");
var engine: BABYLON.Engine = new BABYLON.Engine(canvas, true);
var scene: BABYLON.Scene = createScene(engine, canvas);

engine.runRenderLoop(() => {
    scene.render();
});