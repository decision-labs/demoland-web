import {
    type LayerName, type MacroVar,
    type ScenarioChanges, type ScenarioValues, type Scenario,
    type ChangesObject, type ValuesObject, type ScenarioObject,
    type ScaleFactorMap,
    GLOBALMIN, GLOBALMAX
} from "src/constants";

export function rescale(
    layerName: LayerName,
    unscaledVal: number,
    scaleFactors: ScaleFactorMap | null
): number {
    // TODO: define layer type and specify whether categorical or not
    if (layerName === "signature_type") {
        return unscaledVal;
    }
    else {
        if (scaleFactors === null) {
            return unscaledVal;
        } else {
            const min = scaleFactors.get(layerName).min;
            const max = scaleFactors.get(layerName).max;
            return GLOBALMIN + (GLOBALMAX - GLOBALMIN) * (unscaledVal - min) / (max - min);
        }
    }
}

export function unscale(
    layerName: LayerName,
    scaledVal: number,
    scaleFactors: ScaleFactorMap | null
): number {
    // TODO: define layer type and specify whether categorical or not
    if (layerName === "signature_type") {
        return scaledVal;
    }
    else {
        if (scaleFactors === null) {
            return scaledVal;
        } else {
            const min = scaleFactors.get(layerName).min;
            const max = scaleFactors.get(layerName).max;
            return min + (max - min) * (scaledVal - GLOBALMIN) / (GLOBALMAX - GLOBALMIN);
        }
    }
}

/* Helper function to preprocess all raw values. Rounds to 6sf and clips
 * negative values to 0. Overly precise values lead to rounding errors and
 * spurious 'differences' in the map. */
function preprocess(num: number): number {
    return Math.max(+num.toPrecision(6), 0);
}

/* Generate the Map of input changes for a scenario, from a regular object. */
export function fromChangesObject(
    changes: object,
    validAreaNames: Set<string> | null,
): ScenarioChanges {
    const changesMap = new Map();
    // Loop over OAs
    for (const [oa, map] of Object.entries(changes)) {
        if (validAreaNames !== null && !validAreaNames.has(oa)) {
            throw new Error(`Invalid OA in scenario: ${oa}`);
        }
        changesMap.set(oa, new Map());
        // Loop over macrovariables
        for (const [key, value] of Object.entries(map)) {
            changesMap
                .get(oa)
                .set(key as MacroVar, value as number);
        }
    }
    return changesMap;
}

/* Generate the Map of output values in a scenario, from a regular object.
 * The `scale` parameter indicates whether the values should be scaled. */
export function fromValuesObject(
    values: object,
    scaleFactors: ScaleFactorMap | null,
    validAreaNames: Set<string> | null,
): ScenarioValues {
    const valuesMap = new Map();
    for (const [oa, map] of Object.entries(values)) {
        if (validAreaNames !== null && !validAreaNames.has(oa)) {
            throw new Error(`Invalid OA in scenario: ${oa}`);
        }
        valuesMap.set(oa, new Map());
        for (const [key, value] of Object.entries(map)) {
            if (value === null) {
                throw new Error("Null value in scenario");
            }
            const layerName = key as LayerName;
            valuesMap.get(oa)
                .set(layerName, rescale(layerName, preprocess(value as number), scaleFactors));
        }
    }
    return valuesMap;
}

/* Convert a ScenarioChanges map into a regular object. */
export function toChangesObject(
    changes: ScenarioChanges
): ChangesObject {
    const changesObj = {};
    for (const [oa, m] of changes.entries()) {
        changesObj[oa] = {};
        for (const [mv, v] of m.entries()) {
            changesObj[oa][mv] = v;
        }
    }
    return changesObj;
}

/* Convert a ScenarioValues map into a regular object. */
export function toValuesObject(
    values: ScenarioValues,
    scaleFactors: ScaleFactorMap | null
): ValuesObject {
    const valuesObj = {};
    for (const [oa, m] of values.entries()) {
        valuesObj[oa] = {};
        for (const [ln, val] of m.entries()) {
            valuesObj[oa][ln] = unscale(ln, val, scaleFactors);
        }
    }
    return valuesObj;
}

/* Read in a scenario from a JSON file.
 * The JSON file must be an object with three keys:
 *    - metadata: an object with the keys name, short, long, description
 *    - changes: an object which can be parsed by createChangesMap
 *    - values: an object which can be parsed by createValuesMap
 * TODO: expose a `source` argument for more informative error messages */
export function fromScenarioObject(
    json: ScenarioObject,
    scaleFactors: ScaleFactorMap | null,
    validAreaNames: Set<string> | null,
): Scenario {
    // Validation: check top-level keys
    for (const field of ["metadata", "changes", "values"]) {
        if (!Object.hasOwn(json, field)) {
            throw new Error(`The scenario JSON file does not have a '${field}' field.`);
        }
        if (typeof json[field] !== "object") {
            throw new Error(`The ${field} field in the scenario JSON file is not an object.`);
        }
    }
    // Validation: check metadata keys
    for (const field of ["name", "short", "long", "description"]) {
        if (!Object.hasOwn(json.metadata, field)) {
            throw new Error(
                `The scenario JSON file does not have a 'metadata.${field}' key.`
            );
        }
        if (typeof json.metadata[field] !== "string") {
            throw new Error(
                `The 'metadata.${field}' key in the scenario JSON file is not a string.`
            );
        }
    }

    // Parsing
    const metadata = json.metadata;
    const changes = fromChangesObject(json.changes, validAreaNames);
    const values = fromValuesObject(json.values, scaleFactors, validAreaNames);
    return {
        metadata: metadata,
        changes: changes,
        values: values
    };
}

/* Convert a scenario to a regular object.
 * TODO: Ensure that fromScenarioObject(toScenarioObject(scenario)) === scenario */
export function toScenarioObject(
    scenario: Scenario,
    scaleFactors: ScaleFactorMap
): ScenarioObject {
    return {
        metadata: scenario.metadata,
        changes: toChangesObject(scenario.changes),
        values: toValuesObject(scenario.values, scaleFactors)
    };
}
