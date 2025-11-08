let CANVAS;
let ctx;
let aimtrainer;
let l = 0;
let crosshairDeductionTimeV = 0;
let outerCanvas;
const DEFAULTCROSSHAIRSIZE = 10;
let crosshairSize = DEFAULTCROSSHAIRSIZE;
let lineThickness = 2;
let outerLayerCTX;
let deltatime = l;
let mouseCOORDS = {
    x: 1,
    y: 0
};
let resizeCursor = 0;

document.addEventListener("DOMContentLoaded", () => {
    initialize();
})
function initialize(){
    CANVAS = document.getElementById("mainCanvas");
    ctx = CANVAS.getContext('2d');
    outerCanvas = document.createElement('canvas');
    outerLayerCTX = outerCanvas.getContext('2d');
    outerCanvas.classList.add("cursorOverlay");
    document.body.appendChild(outerCanvas);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    aimtrainer = new AIMTRAINER();
    CANVAS.addEventListener("click", (e) => {
        aimtrainer.handleClicks(e.clientX, e.clientY);
    });
    CANVAS.addEventListener("mousedown", () => {
        resizeCursor = -1;
    })
    document.addEventListener("mousemove", (e) => {
        mouseCOORDS.x = e.clientX;
        mouseCOORDS.y = e.clientY;
    })
    animationLoop(l);
    drawCursorOverlay();
}
function drawCursorOverlay(){
    outerLayerCTX.clearRect(0, 0, outerCanvas.width, outerCanvas.height);
    console.log(crosshairDeductionTimeV)
        console.log(resizeCursor)

    if(resizeCursor === -1){
        crosshairSize = crosshairSize - 0.4;
        crosshairDeductionTimeV = crosshairDeductionTimeV + deltatime;
    }
    if(resizeCursor === 1){
        crosshairSize = crosshairSize + 0.4;
        crosshairDeductionTimeV = crosshairDeductionTimeV + deltatime;
    }
    if(crosshairDeductionTimeV > 100){
        resizeCursor = 1;
    }
    if(crosshairDeductionTimeV > 200){
        resizeCursor = 0;
        crosshairDeductionTimeV = 0;
        crosshairSize = DEFAULTCROSSHAIRSIZE;
    }
    outerLayerCTX.save();
    outerLayerCTX.translate(mouseCOORDS.x, mouseCOORDS.y);
    outerLayerCTX.fillRect(-crosshairSize, -lineThickness / 2, crosshairSize * 2, lineThickness);
    outerLayerCTX.fillRect(-lineThickness / 2, -crosshairSize, lineThickness, crosshairSize * 2);
    outerLayerCTX.restore();

    requestAnimationFrame(drawCursorOverlay);
}
function resizeCanvas(){
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    outerCanvas.width = window.innerWidth;
    outerCanvas.height = window.innerHeight;
}
function animationLoop(t){
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)
    deltatime = t - l;
    l = t;
    aimtrainer.update(ctx, deltatime);
    requestAnimationFrame(animationLoop);
}
class AIMTRAINER{
    constructor(){
        this.timeinMS = 0;
        this.timeInSeconds = this.timeinMS/1000;
        this.startTime = performance.now();

        setInterval(() => {
            let now = performance.now();
            this.timeinMS = now - this.startTime;
            this.timeInSeconds = this.timeinMS / 1000;
        }, 10);
        this.targetsHit = 0;
        this.missedClicks = 0;
        this.width = 25;
        this.targets = [];
        this.targetTimer = 0;
        this.targetInterval = 500;
        this.disappearingTargets = false;   //disappear targets or not
        this.disappearedTargets = 0;
        this.targetAliveTime = 2000;
    }
    handleClicks(x, y){
        this.missedClicks++;
        this.targets.forEach((target) => {
            if(target.id === 1){
                if(x >= target.x && 
                x <= (target.x + target.width) &&
                y >= target.y && 
                y <= (target.y + target.height)){
                    target.markedForDeletion = true;
                    this.targetsHit++;
                    this.missedClicks--;
                }
            }else if(target.id === 2){
                if(((x - target.x) ** 2 + (y - target.y) ** 2) < (target.radius ** 2)){
                    target.markedForDeletion = true;
                    this.targetsHit++;
                    this.missedClicks--;
                }
            }
        })
        if(x >= 10 && 
            x <= (10 + 440) &&
            y >= 165 && 
            y <= (165 + 40)){
                this.missedClicks--;
                this.disappearingTargets = !this.disappearingTargets;
        }
    }
    update(ctx, deltatime){
        this.#draw(ctx);
        this.targetTimer = this.targetTimer + deltatime;
        if(this.targetTimer >= this.targetInterval){
            this.spawnNewTarget();
            this.targetTimer = 0;
        }
        this.targets = this.targets.filter((target) => {
            return !target.markedForDeletion;
        });
    }
    #draw(ctx){
        ctx.save();
        ctx.fillStyle = "red";
        this.targets.forEach((target) => {
            if(target.id === 1){
                ctx.fillRect(target.x, target.y, target.width, target.height);
            }else if(target.id === 2){
                ctx.beginPath();
                ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2)
                ctx.fill();
            }
        })
        ctx.restore();
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.font = "bold 40px 'Hind Siliguri', sans-serif";
        ctx.fillText("Targets hit: " + this.targetsHit, 10, 20);
        ctx.fillText("Missed clicks: " + this.missedClicks, 10, 70);
        ctx.fillText("Time elapsed (seconds): " + this.timeInSeconds.toFixed(2), 10, 120);
        ctx.save();
        ctx.fillStyle = "rgba(220, 168, 0, 1)";
        ctx.fillText("Disappear targets?: " + this.disappearingTargets, 10, 170);
        if(this.disappearingTargets){
            ctx.fillStyle = "rgba(241, 255, 42, 1)";
            ctx.fillText("Disappeared targets: " + this.disappearedTargets, 10, 220);
        }
        ctx.restore();
    }
    spawnNewTarget(){
        if(Math.random() < 0.5){
            let t = new TARGET_SQUARE(this.width, this.width);
            this.targets.push(t);
            if(this.disappearingTargets){
                setTimeout(() => {
                    t.markedForDeletion = true;
                    t.disappearedTargets++;
                }, this.targetAliveTime)
            }
        }else{
            let t = new TARGET_CIRCLE(this.width / 2);
            this.targets.push(t);
            if(this.disappearingTargets){
                setTimeout(() => {
                    t.markedForDeletion = true;
                    this.disappearedTargets++;
                }, this.targetAliveTime)
            }
        }
    }
}
class TARGET_SQUARE{
    constructor(width, height){
        this.id = 1;
        this.x = Math.random() * (CANVAS.width - width);
        this.y = Math.random() * (CANVAS.height - height);
        this.width = width;
        this.height = height;
        this.markedForDeletion = false;
    }
}
class TARGET_CIRCLE{
    constructor(radius){
        this.id = 2;
        this.x = Math.random() * (CANVAS.width - radius) + radius;
        this.y = Math.random() * (CANVAS.height - radius) + radius;
        this.radius = radius;
        this.markedForDeletion = false;
    }
}