
import { UMath } from "./wCanvas/wcanvas.js";
import { KarnaughMap, getXYVarCount } from "./KarnaughMap.js";
import { MapStyle } from "./MapStyle.js";

/**
 * Checks if the specified color is valid
 * @param {[Number, Number, Number]} color - The color to check for
 * @returns {Boolean} Whether or not the color is a valid one
 */
export function isValidColor(color) {
    return color instanceof Array && color.length === 3 &&
        typeof color[0] === "number" && color[0] >= 0 && color[0] <= 255 &&
        typeof color[1] === "number" && color[1] >= 0 && color[1] <= 255 &&
        typeof color[2] === "number" && color[2] >= 0 && color[2] <= 255;
}

/**
 * Checks if the specified group is valid
 * @param {import("./KarnaughMap.js").Group} group - The group to check for
 * @param {UMath.Vec2} gridSize - The size of the Map the group is from
 * @returns {Boolean} Whether or not the group is a valid one
 */
export function isValidGroup(group, gridSize) {
    return group instanceof Array && group.length === 5 &&
        typeof group[0] === "number" && group[0] >= 0 && group[0] <= gridSize.x - 1 &&
        typeof group[1] === "number" && group[1] >= 0 && group[1] <= gridSize.y - 1 &&
        typeof group[2] === "number" && group[2] >= 1 && group[2] <= gridSize.x &&
        typeof group[3] === "number" && group[3] >= 1 && group[3] <= gridSize.y &&
        isValidColor(group[4]);
}

/**
 * Checks if the specified MapStyle is valid
 * @param {MapStyle} mapStyle - The MapStyle to check for
 * @returns {Boolean} Whether or not the MapStyle is a valid one
 */
export function isValidMapStyle(mapStyle) {
    return mapStyle instanceof Object &&
        mapStyle.lines instanceof Object &&
            isValidColor(mapStyle.lines.color) && typeof mapStyle.lines.width === "number" && mapStyle.lines.width >= 0 &&
        mapStyle.text instanceof Object &&
            isValidColor(mapStyle.text.color) && typeof mapStyle.text.scale === "number" && mapStyle.text.scale >= 0 &&
        mapStyle.outValues instanceof Object &&
            isValidColor(mapStyle.outValues.color) && typeof mapStyle.outValues.scale === "number" && mapStyle.outValues.scale >= 0 &&
        mapStyle.groups instanceof Object &&
            typeof mapStyle.groups.borderWidth === "number" && mapStyle.groups.borderWidth >= 0;
}

/**
 * Tests all elements of the specified Array
 * @template T
 * @param {Array<T>} arr - The Array to test
 * @param {(el: T) => Boolean} testFunc - The function to test the array with
 * @returns {Boolean} Whether or not all elements satisfy testFunc
 */
function testArrayElements(arr, testFunc) {
    for (let i = 0; i < arr.length; i++) {
        if (!testFunc(arr[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Checks if the specified KarnaughMap is valid
 * @param {KarnaughMap} kMap - The KarnaughMap to check for
 * @returns {Boolean} Whether or not the KarnaughMap is a valid one
 */
export function isValidKarnaughMap(kMap) {
    const size = getXYVarCount(kMap.varCount);
    size.x = Math.pow(2, size.x);
    size.y = Math.pow(2, size.y);

    return kMap instanceof Object &&
        typeof kMap.varCount === "number" && kMap.varCount >= 2 && kMap.varCount <= 4 &&
        kMap.groups instanceof Array &&
            testArrayElements(kMap.groups, group => isValidGroup(group, size)) &&
        kMap.outValues instanceof Array &&
            testArrayElements(kMap.outValues, row => row instanceof Array && testArrayElements(row, cell => cell === 0 || cell === 1)) &&
        isValidMapStyle(kMap.style) &&
        kMap.varNames instanceof Array && kMap.varNames.length >= kMap.varCount &&
            testArrayElements(kMap.varNames, name => typeof name === "string");
}
