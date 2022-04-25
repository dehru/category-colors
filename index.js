const chroma = require("chroma-js");

const stripeColors = [
    "#f5fbff",
    "#d6ecff",
    "#a4cdfe",
    "#7dabf8",
    "#6c8eef",
    "#5469d4",
    "#3d4eac",
    "#2f3d89",
    "#212d63",
    "#131f41",
    "#efffed",
    "#cbf4c9",
    "#85d996",
    "#33c27f",
    "#1ea672",
    "#09825d",
    "#0e6245",
    "#0d4b3b",
    "#0b3733",
    "#082429",
    "#fcf9e9",
    "#f8e5b9",
    "#efc078",
    "#e5993e",
    "#d97917",
    "#bb5504",
    "#983705",
    "#762b0b",
    "#571f0d",
    "#3a1607",
    "#fff8f5",
    "#fde2dd",
    "#fbb5b2",
    "#fa8389",
    "#ed5f74",
    "#cd3d64",
    "#a41c4e",
    "#80143f",
    "#5e1039",
];

// random from array
const randomFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// generate a random color
const randomColor = () => {
    const color = chroma.random();
    return color;
};

// measures the distance between two colors
const distance = (color1, color2) => chroma.deltaE(color1, color2);

// put colors in hue order
const sortByHue = (colorArray) => {
    return colorArray.sort((a, b) => {
        return a.hsl()[0] - b.hsl()[0];
    });
};

const getClosestColor = (color, colorArray) => {
    const distances = colorArray.map((c) => distance(color, c));
    const minIndex = distances.indexOf(Math.min(...distances));
    return colorArray[minIndex];
};

// array of distances between all points in a color array
const distances = (colorArray, visionSpace = "Normal") => {
    const distances = [];
    const convertedColors = colorArray.map((c) =>
        brettelFunctions[visionSpace](c.rgb())
    );
    for (let i = 0; i < colorArray.length; i++) {
        for (let j = i + 1; j < colorArray.length; j++) {
            distances.push(distance(convertedColors[i], convertedColors[j]));
        }
    }
    return distances;
};

// get average of interger array
const average = (array) => array.reduce((a, b) => a + b) / array.length;

// get the sum of interger array
const sumOfArray = (array) => array.reduce((a, b) => a + b);

// get the distance between the highest and lowest values in an array
const range = (array) => {
    const sorted = array.sort((a, b) => a - b);
    return sorted[sorted.length - 1] - sorted[0];
};

// produces a color a small random distance away from the given color
const randomNearbyColor = (color) => {
    const channelToChange = randomFromArray([0, 1, 2]);
    const oldVal = color.gl()[channelToChange];
    let newVal = oldVal + Math.random() * 0.1 - 0.05;
    if (newVal > 1) {
        newVal = 1;
    } else if (newVal < 0) {
        newVal = 0;
    }
    return color.set(`rgb.${"rgb"[channelToChange]}`, newVal * 255);
};

// average of distances between array of colors and stripe colors
const averageDistanceFromStripeColors = (colors) => {
    const distances = colors.map((c) =>
        distance(c, getClosestColor(c, stripeColors))
    );
    return average(distances);
};

// convert a linear rgb value to sRGB
function linearRGB_from_sRGB(v) {
    var fv = v / 255.0;
    if (fv < 0.04045) return fv / 12.92;
    return Math.pow((fv + 0.055) / 1.055, 2.4);
}

function sRGB_from_linearRGB(v) {
    if (v <= 0) return 0;
    if (v >= 1) return 255;
    if (v < 0.0031308) return 0.5 + v * 12.92 * 255;
    return 0 + 255 * (Math.pow(v, 1.0 / 2.4) * 1.055 - 0.055);
}

var brettelFunctions = {
    Normal: function (v) {
        return v;
    },
    Protanopia: function (v) {
        return brettel(v, "protan", 1.0);
    },
    Protanomaly: function (v) {
        return brettel(v, "protan", 0.6);
    },
    Deuteranopia: function (v) {
        return brettel(v, "deutan", 1.0);
    },
    Deuteranomaly: function (v) {
        return brettel(v, "deutan", 0.6);
    },
    Tritanopia: function (v) {
        return brettel(v, "tritan", 1.0);
    },
    Tritanomaly: function (v) {
        return brettel(v, "tritan", 0.6);
    },
    Achromatopsia: function (v) {
        return monochrome_with_severity(v, 1.0);
    },
    Achromatomaly: function (v) {
        return monochrome_with_severity(v, 0.6);
    },
};

var sRGB_to_linearRGB_Lookup = Array(256);
(function () {
    var i;
    for (i = 0; i < 256; i++) {
        sRGB_to_linearRGB_Lookup[i] = linearRGB_from_sRGB(i);
    }
})();

brettel_params = {
    protan: {
        rgbCvdFromRgb_1: [
            0.1451, 1.20165, -0.34675, 0.10447, 0.85316, 0.04237, 0.00429,
            -0.00603, 1.00174,
        ],
        rgbCvdFromRgb_2: [
            0.14115, 1.16782, -0.30897, 0.10495, 0.8573, 0.03776, 0.00431,
            -0.00586, 1.00155,
        ],
        separationPlaneNormal: [0.00048, 0.00416, -0.00464],
    },

    deutan: {
        rgbCvdFromRgb_1: [
            0.36198, 0.86755, -0.22953, 0.26099, 0.64512, 0.09389, -0.01975,
            0.02686, 0.99289,
        ],
        rgbCvdFromRgb_2: [
            0.37009, 0.8854, -0.25549, 0.25767, 0.63782, 0.10451, -0.0195,
            0.02741, 0.99209,
        ],
        separationPlaneNormal: [-0.00293, -0.00645, 0.00938],
    },

    tritan: {
        rgbCvdFromRgb_1: [
            1.01354, 0.14268, -0.15622, -0.01181, 0.87561, 0.13619, 0.07707,
            0.81208, 0.11085,
        ],
        rgbCvdFromRgb_2: [
            0.93337, 0.19999, -0.13336, 0.05809, 0.82565, 0.11626, -0.37923,
            1.13825, 0.24098,
        ],
        separationPlaneNormal: [0.0396, -0.02831, -0.01129],
    },
};

function brettel(srgb, t, severity) {
    // Go from sRGB to linearRGB
    var rgb = Array(3);
    rgb[0] = sRGB_to_linearRGB_Lookup[srgb[0]];
    rgb[1] = sRGB_to_linearRGB_Lookup[srgb[1]];
    rgb[2] = sRGB_to_linearRGB_Lookup[srgb[2]];

    var params = brettel_params[t];
    var separationPlaneNormal = params["separationPlaneNormal"];
    var rgbCvdFromRgb_1 = params["rgbCvdFromRgb_1"];
    var rgbCvdFromRgb_2 = params["rgbCvdFromRgb_2"];

    // Check on which plane we should project by comparing wih the separation plane normal.
    var dotWithSepPlane =
        rgb[0] * separationPlaneNormal[0] +
        rgb[1] * separationPlaneNormal[1] +
        rgb[2] * separationPlaneNormal[2];
    var rgbCvdFromRgb =
        dotWithSepPlane >= 0 ? rgbCvdFromRgb_1 : rgbCvdFromRgb_2;

    // Transform to the full dichromat projection plane.
    var rgb_cvd = Array(3);
    rgb_cvd[0] =
        rgbCvdFromRgb[0] * rgb[0] +
        rgbCvdFromRgb[1] * rgb[1] +
        rgbCvdFromRgb[2] * rgb[2];
    rgb_cvd[1] =
        rgbCvdFromRgb[3] * rgb[0] +
        rgbCvdFromRgb[4] * rgb[1] +
        rgbCvdFromRgb[5] * rgb[2];
    rgb_cvd[2] =
        rgbCvdFromRgb[6] * rgb[0] +
        rgbCvdFromRgb[7] * rgb[1] +
        rgbCvdFromRgb[8] * rgb[2];

    // Apply the severity factor as a linear interpolation.
    // It's the same to do it in the RGB space or in the LMS
    // space since it's a linear transform.
    rgb_cvd[0] = rgb_cvd[0] * severity + rgb[0] * (1.0 - severity);
    rgb_cvd[1] = rgb_cvd[1] * severity + rgb[1] * (1.0 - severity);
    rgb_cvd[2] = rgb_cvd[2] * severity + rgb[2] * (1.0 - severity);

    // Go back to sRGB
    return [
        sRGB_from_linearRGB(rgb_cvd[0]),
        sRGB_from_linearRGB(rgb_cvd[1]),
        sRGB_from_linearRGB(rgb_cvd[2]),
    ];
}

// Adjusted from the hcirn code
function monochrome_with_severity(srgb, severity) {
    var z = Math.round(srgb[0] * 0.299 + srgb[1] * 0.587 + srgb[2] * 0.114);
    var r = z * severity + (1.0 - severity) * srgb[0];
    var g = z * severity + (1.0 - severity) * srgb[1];
    var b = z * severity + (1.0 - severity) * srgb[2];
    return [r, g, b];
}

const cost = (state) => {
    const energyWeight = 1;
    const rangeWeight = 1;
    const stripeWeight = 1;
    const protonopiaWeight = 0.33;
    const deuteranopiaWeight = 0.33;
    const tritanopiaWeight = 0.33;

    const normalDistances = distances(state);
    const protanopiaDistances = distances(state, "Protanopia");
    const deuteranopiaDistances = distances(state, "Deuteranopia");
    const tritanopiaDistances = distances(state, "Tritanopia");

    const energy = sumOfArray(normalDistances);

    const energyScore =  100 - (energy / (normalDistances.length)); // higher is better
    const protanopiaScore = 100 - average(protanopiaDistances); // higher is better
    const deuteranopiaScore = 100 - average(deuteranopiaDistances); // higher is better
    const tritanopiaScore = 100 - average(tritanopiaDistances); // higher is better
    const rangeScore = range(normalDistances); // lower is better
    const stripeScore = averageDistanceFromStripeColors(state); // lower is better

    return (
        energyWeight * energyScore +
        stripeWeight * stripeScore +
        rangeWeight * rangeScore +
        protonopiaWeight * protanopiaScore +
        deuteranopiaWeight * deuteranopiaScore +
        tritanopiaWeight * tritanopiaScore
    );
};

// find n colors that are equidistant from each other
// using simulated annealing
const optimize = (n = 5) => {
    // initialize colors
    const colors = [];
    for (let i = 0; i < n; i++) {
        colors.push(randomColor());
    }

    // intialize hyperparameters
    let temperature = 1000;
    const coolingRate = 0.99;
    const cutoff = 0.0001;

    // iteration loop
    while (temperature > cutoff) {
        // for each color
        for (let i = 0; i < colors.length; i++) {
            // copy old colors
            const newColors = colors.map((color) => color);
            // move the current color randomly
            newColors[i] = randomNearbyColor(newColors[i]);

            const delta = cost(newColors) - cost(colors);
            const probability = Math.exp(-delta / temperature);
            if (Math.random() < probability) {
                colors[i] = newColors[i];
            }
        }
        console.log(cost(colors));

        // decrease temperature
        temperature *= coolingRate;
    }

    console.log(colors.map((color) => color.hex()));
    return colors;
};

optimize(5);