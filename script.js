let CANVAS;
let ctx;
let aimtrainer;
let l = 0;
let outerCanvas;
let outerLayerCTX;
let mouseCOORDS = {
    x: 1,
    y: 0
};
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

    outerLayerCTX.save();
    outerLayerCTX.translate(mouseCOORDS.x, mouseCOORDS.y);
    outerLayerCTX.fillRect(-12, -2, 21, 1);
    outerLayerCTX.fillRect(-2, -12, 1, 21);
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
    aimtrainer.update(ctx, t - l);
    l = t;
    requestAnimationFrame(animationLoop);
}
class AIMTRAINER{
    constructor(){
        this.targetsHit = 0;
        this.missedClicks = 0;
        this.width = 25;
        this.targets = [];
        this.targetTimer = 0;
        this.targetInterval = 500;
        this.disappearingTargets = true;   //disappear targets or not
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
        ctx.fillRect(10, 115, 440, 40);
        if(x >= 10 && 
            x <= (10 + 440) &&
            y >= 115 && 
            y <= (115 + 40)){
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
        ctx.save();
        ctx.fillStyle = "rgba(220, 168, 0, 1)";
        ctx.fillText("Disappear targets?: " + this.disappearingTargets, 10, 120);
        if(this.disappearingTargets){
            ctx.fillStyle = "rgba(241, 255, 42, 1)";
            ctx.fillText("Disappeared targets: " + this.disappearedTargets, 10, 170);
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