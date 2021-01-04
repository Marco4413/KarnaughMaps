
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

/**
 * @param {wCanvas} canvas
 * @param {Number} deltaTime
 */
function draw(canvas, deltaTime) {
    console.log(deltaTime);
    canvas.background(0, 0, 0);
}

window.addEventListener("load", () => {

    new wCanvas(
        {
            "onDraw": draw
        }
    );

});
