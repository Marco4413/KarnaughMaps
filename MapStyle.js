
import { Color } from "./wCanvas/wcanvas.js";
import { isValidMapStyle } from "./validationUtils.js";

/**
 * Returns the specified MapStyle as a Dictionary
 * @param {MapStyle} mapStyle - The MapStyle to return as a Dictionary
 * @returns {Object} The specified MapStyle as a Dictionary
 */
export function mapStyleToDict(mapStyle) {
    return {
        "lines": {
            "color": mapStyle.lines.color.toRGB(true),
            "width": mapStyle.lines.width
        },
        "text": {
            "color": mapStyle.text.color.toRGB(true),
            "scale": mapStyle.text.scale
        },
        "outValues": {
            "color": mapStyle.outValues.color.toRGB(true),
            "scale": mapStyle.outValues.scale
        },
        "groups": {
            "borderWidth": mapStyle.groups.borderWidth
        }
    }
}

export class MapStyle {

    /**
     * @param {Color|String|Number|[ Number, Number, Number ]} linesColor 
     * @param {Number} linesWidth 
     * @param {Color|String|Number|[ Number, Number, Number ]} textColor 
     * @param {Number} textScale 
     * @param {Color|String|Number|[ Number, Number, Number ]} outValuesColor 
     * @param {Number} outValuesScale 
     * @param {Number} groupsBorderWidth 
     */
    constructor(linesColor = 255, linesWidth = 2, textColor = 255, textScale = 0.33, outValuesColor = 255, outValuesScale = 0.5, groupsBorderWidth = 4) {
        this.lines = {
            "color": new Color(linesColor),
            "width": linesWidth
        };
        this.text = {
            "color": new Color(textColor),
            "scale": textScale
        };
        this.outValues = {
            "color": new Color(outValuesColor),
            "scale": outValuesScale
        };
        this.groups = {
            "borderWidth": groupsBorderWidth
        };
    }

    /**
     * Serializes this MapStyle into a JSON string
     * @returns {false|String} False if it failed to serialize, the serialized style if it succeeded
     */
    serialize() {
        if (isValidMapStyle(this)) {

            return JSON.stringify(
                mapStyleToDict(this), undefined, 0
            );

        }

        return false;
    }

    /**
     * Loads the specified JSON string into itself
     * @param {String} str - The string to deserialize
     * @returns {Boolean} Whether or not deserialization was succesful
     */
    deserialize(str) {

        try {
            const style = JSON.parse(str);
            if (isValidMapStyle(style)) {
                this.lines = {
                    "color": new Color(style.lines.color),
                    "width": style.lines.width
                };
                this.text = {
                    "color": new Color(style.text.color),
                    "scale": style.text.scale
                };
                this.outValues = {
                    "color": new Color(style.outValues.color),
                    "scale": style.outValues.scale
                };
                this.groups = {
                    "borderWidth": style.groups.borderWidth
                };

                return true;
            }
        } catch (err) { }

        console.error("Failed to deserialize MapStyle:", str);

        return false;

    }

}
