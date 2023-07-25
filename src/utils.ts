import geography from "./assets/newcastle.json";
import colormap from "colormap";
import maplibregl from "maplibre-gl";
import union from "@turf/union";
import { OverlayScrollbars } from "overlayscrollbars";
import { allIndicators, type IndicatorName, allScenarios, type ScenarioName, signatures, GLOBALMIN, GLOBALMAX, type MacroVar } from "./constants";

export function makeColormap(indicator: IndicatorName | "diff", n: number) {
    if (indicator === "diff") {
        return colormap({
            colormap: "RdBu",
            nshades: n,
            format: "hex",
            alpha: 1,
        });
    }
    else {
        const indi = allIndicators.get(indicator);
        const cmap = colormap({
            colormap: indi.colormap,
            nshades: n,
            format: "hex",
            alpha: 1,
        });
        return indi.colormapReversed ? cmap.reverse() : cmap;
    }
}

// Get all values for a given indicator in a given scenario.
export function getValues(indicator: IndicatorName, scenarioName: ScenarioName): number[] {
    const scenario = allScenarios.get(scenarioName);
    return [...scenario.values.values()].map(m => m.get(indicator));
}

const colormaps: { [key: string]: string[] } = {
    "air_quality": makeColormap("air_quality", 100),
    "house_price": makeColormap("house_price", 100),
    "job_accessibility": makeColormap("job_accessibility", 100),
    "greenspace_accessibility": makeColormap("greenspace_accessibility", 100),
    "diff": makeColormap("diff", 100),
}

function getColorFromMap(map: string[], value: number, min: number, max: number) {
    const n = map.length;
    const i = Math.round(((value - min) / (max - min)) * (n - 1));
    return map[i];
}

/** The indicator values are stored as a JSON file, separate from the
 * geometry data. This allows the geometry data to be reused for different
 * scenarios. However, it also means that we need to merge the two data
 * sources together before we can display them on the map.
 *
 * It also proves easier to encode the colours for each indicator here, because
 * otherwise it results in some really complicated expressions in MapLibre.
 * 
 * @param {ScenarioName} scenarioName: the name of the scenario being used.
 * @param {ScenarioName} compareScenarioName: the name of the scenario being
 * compared against.
 *
 * @returns an updated GeoJSON file with the indicator values plus associated
 * colours added to the properties of each feature.
 */
export function makeCombinedGeoJSON(
    scenarioName: ScenarioName,
    compareScenarioName: ScenarioName | null,
): GeoJSON.FeatureCollection {
    const scenario = allScenarios.get(scenarioName);

    // Precalculate differences between scenarios being compared
    const maxDiffExtent: Map<IndicatorName, number> = new Map();
    if (compareScenarioName !== null) {
        const scenario = allScenarios.get(scenarioName);
        const cScenario = allScenarios.get(compareScenarioName);
        for (const indiName of allIndicators.keys()) {
            const diffs: number[] = [];
            for (const oa of scenario.values.keys()) {
                diffs.push(scenario.values.get(oa).get(indiName) - cScenario.values.get(oa).get(indiName));
            }
            const maxDiff = Math.max(...diffs.map(d => Math.abs(d)));
            maxDiffExtent.set(indiName, maxDiff === 0 ? 1 : maxDiff);
        }
    }

    // Merge geography with indicators
    geography.features = geography.features.map(function(feature) {
        const oaName = feature.properties.OA11CD;
        const oaValues = scenario.values.get(oaName);
        if (oaValues === undefined) {
            throw new Error(`${oaName} not found in values!`);
        }
        for (const indiName of allIndicators.keys()) {
            feature.properties[indiName] = oaValues.get(indiName);
            feature.properties[`${indiName}-color`] =
                getColorFromMap(colormaps[indiName], oaValues.get(indiName), GLOBALMIN, GLOBALMAX);
        }
        feature.properties["sig"] = scenario.values.get(oaName).get("sig");
        feature.properties["sig-color"] = signatures[feature.properties["sig"]].color;
        if (compareScenarioName !== null) {
            const cScenario = allScenarios.get(compareScenarioName);
            const cOaValues = cScenario.values.get(oaName);
            if (cOaValues === undefined) {
                throw new Error(`${oaName} not found in compare values!`);
            }
            for (const indiName of allIndicators.keys()) {
                feature.properties[`${indiName}-cmp`] = cOaValues.get(indiName);
                feature.properties[`${indiName}-cmp-color`] =
                    getColorFromMap(colormaps[indiName], cOaValues.get(indiName), GLOBALMIN, GLOBALMAX);
                feature.properties["sig-cmp"] = cScenario.values.get(oaName).get("sig");
                feature.properties["sig-cmp-color"] = signatures[feature.properties["sig-cmp"]].color;
                // The 'difference' view for land use is just the ones that are
                // changed relative to the scenario being compared against
                if (feature.properties["sig"] === feature.properties["sig-cmp"]) {
                    feature.properties["sig-diff-color"] = "rgba(0, 0, 0, 0.1)";
                } else {
                    feature.properties["sig-diff-color"] = feature.properties["sig-color"];
                }
                feature.properties[`${indiName}-diff`] = oaValues.get(indiName) - cOaValues.get(indiName);
                feature.properties[`${indiName}-diff-color`] =
                    oaValues.get(indiName) === cOaValues.get(indiName)
                        ? "rgba(0, 0, 0, 0.1)"
                        : getColorFromMap(colormaps["diff"], oaValues.get(indiName) - cOaValues.get(indiName), -maxDiffExtent.get(indiName), maxDiffExtent.get(indiName));
            }
        }

        // @ts-ignore GeoJSON types don't seem to recognise feature id
        feature.id = feature.properties.id;
        return feature;
    });

    // TODO: Figure out how to not cast here
    return geography as GeoJSON.FeatureCollection;
}

// Obtain the LngLatBoundsLike of a Polygon or MultiPolygon geometry object from its coordinates.
export function getGeometryBounds(geometry: GeoJSON.Geometry): maplibregl.LngLatBounds {
    // Helper function which acts on a list of positions.
    function getBoundsFromPositionList(positions: GeoJSON.Position[]): maplibregl.LngLatBounds {
        const initialBounds = new maplibregl.LngLatBounds(positions[0], positions[0]);
        return positions.reduce(function(bounds, posn) {
            // GeoJSON Positions are defined as number[] because they may in
            // principle contain x,y,z (+more) coordinates. We only care about x
            // and y here.
            const coords: maplibregl.LngLatLike = [posn[0], posn[1]];
            return bounds.extend(coords);
        }, initialBounds);
    }

    const geometryType = geometry["type"];
    if (geometryType == "Polygon") {
        // For a Polygon, the first element of the coordinates array is the
        // outer ring, which is the only thing we need.
        return getBoundsFromPositionList(geometry["coordinates"][0]);
    }
    else if (geometryType == "MultiPolygon") {
        // For a MultiPolygon, we just need to get the bounds of each Polygon
        // and then combine them.
        const boundsList = geometry["coordinates"].map(polygon => getBoundsFromPositionList(polygon[0]));
        return boundsList.reduce((bounds, b) => bounds.extend(b));
    }
    else {
        throw new Error(`Unsupported geometry type: ${geometryType}`);
    }
}


// Helper function to check if two maps are equal
function mapsAreEqual<K, V>(m1: Map<K, V>, m2: Map<K, V>): boolean {
    // Check if the maps have the same number of keys
    if (m1.size !== m2.size) {
        return false;
    }
    // Then check each key
    for (const [k, v] of m1.entries()) {
        if (m2.get(k) !== v) {
            return false;
        }
    }
    return true;
}

export function getInputDiffBoundaries(
    scenarioName: ScenarioName,
    compareScenarioName: ScenarioName | null
): GeoJSON.FeatureCollection {
    type MVMap = Map<string, Map<MacroVar, number | null>>;
    const changed: MVMap = allScenarios.get(scenarioName).changed;
    const cChanged: MVMap = compareScenarioName === null
        ? new Map()
        : allScenarios.get(compareScenarioName).changed;

    // Determine OAs which are different
    const allPossibleOAs: Set<string> = new Set([
        ...changed.keys(), ...cChanged.keys()
    ]);
    const differentOAs: Set<string> = new Set();
    for (const oa of allPossibleOAs) {
        const m1 = changed.get(oa);
        const m2 = cChanged.get(oa);
        if (m1 === undefined && m2 === undefined) {
            // Both undefined - no changes occurred wrt baseline
            continue;
        }
        else if (m1 === undefined || m2 === undefined) {
            // One undefined - two scenarios are definitely different
            differentOAs.add(oa);
        }
        else {
            // Both defined - need to check if they are equal
            if (!mapsAreEqual(m1, m2)) differentOAs.add(oa);
        }
    }

    // Extract these OAs from the base geography
    const boundary = {
        "type": "FeatureCollection",
        "crs": geography.crs,
        "features": geography.features.filter(
            feature => differentOAs.has(feature.properties.OA11CD)
        ),
    } as GeoJSON.FeatureCollection;

    // Dissolve the boundaries. But we can't actually use dissolve because that
    // doesn't work with MultiPolygons. We instead use union in a nice,
    // functional-style loop.
    if (boundary.features.length > 0) {
        const unioned = boundary.features.reduce((acc, feature) => {
            const featureGeometry = feature.geometry;
            // Not sure how to best coerce GeoJSON types right now. But it
            // works.
            return union(acc, featureGeometry);
        });
        boundary.features = [unioned];
    }
    return boundary;
}

export function overlayScrollbars(id: string) {
    OverlayScrollbars(document.getElementById(id), {
        overflow: {
            x: 'hidden',
        },
        scrollbars: {
            autoHide: "leave",
            autoHideDelay: 100,
            clickScroll: true,
            dragScroll: true,
        },
    });
}
