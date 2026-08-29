import { settleRequestTrace, } from "../request.mjs";
import { parseContentType } from "@emsenn/computing-with-http/codecs/http";
import { readJsonBody } from "../http.mjs";
function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function schemaObject(schema) {
    return typeof schema === "object" && schema !== null ? schema : {};
}
function issue(path, keyword, message) {
    return Object.freeze({ path, keyword, message });
}
function typeOf(value) {
    if (value === null)
        return "null";
    if (Array.isArray(value))
        return "array";
    if (Number.isInteger(value))
        return "integer";
    return typeof value;
}
function typeMatches(value, type) {
    if (type === "number")
        return typeof value === "number" && Number.isFinite(value);
    if (type === "integer")
        return Number.isInteger(value);
    if (type === "array")
        return Array.isArray(value);
    if (type === "object")
        return isObject(value);
    if (type === "null")
        return value === null;
    return typeof value === type;
}
function allowedTypes(schema) {
    const raw = schema["type"];
    if (typeof raw === "string")
        return [raw];
    if (Array.isArray(raw))
        return raw.filter((item) => typeof item === "string");
    return [];
}
function equalJson(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
function validateString(value, schema, path, issues) {
    const minLength = schema["minLength"];
    if (typeof minLength === "number" && value.length < minLength) {
        issues.push(issue(path, "minLength", `must be at least ${minLength} characters`));
    }
    const maxLength = schema["maxLength"];
    if (typeof maxLength === "number" && value.length > maxLength) {
        issues.push(issue(path, "maxLength", `must be at most ${maxLength} characters`));
    }
    const pattern = schema["pattern"];
    if (typeof pattern === "string" && !new RegExp(pattern).test(value)) {
        issues.push(issue(path, "pattern", `must match ${pattern}`));
    }
    const format = schema["format"];
    if (format === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        issues.push(issue(path, "format", "must be an email address"));
    }
    else if (format === "uri") {
        try {
            new URL(value);
        }
        catch {
            issues.push(issue(path, "format", "must be a URI"));
        }
    }
    else if (format === "uuid" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        issues.push(issue(path, "format", "must be a UUID"));
    }
}
function validateNumber(value, schema, path, issues) {
    const minimum = schema["minimum"];
    if (typeof minimum === "number" && value < minimum) {
        issues.push(issue(path, "minimum", `must be >= ${minimum}`));
    }
    const maximum = schema["maximum"];
    if (typeof maximum === "number" && value > maximum) {
        issues.push(issue(path, "maximum", `must be <= ${maximum}`));
    }
    const exclusiveMinimum = schema["exclusiveMinimum"];
    if (typeof exclusiveMinimum === "number" && value <= exclusiveMinimum) {
        issues.push(issue(path, "exclusiveMinimum", `must be > ${exclusiveMinimum}`));
    }
    const exclusiveMaximum = schema["exclusiveMaximum"];
    if (typeof exclusiveMaximum === "number" && value >= exclusiveMaximum) {
        issues.push(issue(path, "exclusiveMaximum", `must be < ${exclusiveMaximum}`));
    }
}
function validateArray(value, schema, path, issues) {
    const minItems = schema["minItems"];
    if (typeof minItems === "number" && value.length < minItems) {
        issues.push(issue(path, "minItems", `must contain at least ${minItems} items`));
    }
    const maxItems = schema["maxItems"];
    if (typeof maxItems === "number" && value.length > maxItems) {
        issues.push(issue(path, "maxItems", `must contain at most ${maxItems} items`));
    }
    const items = schema["items"];
    if (items !== undefined && (typeof items === "boolean" || isObject(items))) {
        value.forEach((item, index) => validateInto(item, items, `${path}/${index}`, issues));
    }
}
function validateObject(value, schema, path, issues) {
    const required = Array.isArray(schema["required"])
        ? schema["required"].filter((item) => typeof item === "string")
        : [];
    for (const key of required) {
        if (!Object.hasOwn(value, key))
            issues.push(issue(`${path}/${key}`, "required", "is required"));
    }
    const properties = isObject(schema["properties"]) ? schema["properties"] : {};
    for (const [key, childSchema] of Object.entries(properties)) {
        if (Object.hasOwn(value, key) && (typeof childSchema === "boolean" || isObject(childSchema))) {
            validateInto(value[key], childSchema, `${path}/${key}`, issues);
        }
    }
    if (schema["additionalProperties"] === false) {
        for (const key of Object.keys(value)) {
            if (!Object.hasOwn(properties, key))
                issues.push(issue(`${path}/${key}`, "additionalProperties", "is not allowed"));
        }
    }
}
function validateInto(value, schema, path, issues) {
    if (schema === true)
        return;
    if (schema === false) {
        issues.push(issue(path, "falseSchema", "is not allowed"));
        return;
    }
    const object = schemaObject(schema);
    const types = allowedTypes(object);
    if (types.length && !types.some((type) => typeMatches(value, type))) {
        issues.push(issue(path, "type", `must be ${types.join(" or ")}, got ${typeOf(value)}`));
        return;
    }
    if ("const" in object && !equalJson(value, object["const"])) {
        issues.push(issue(path, "const", "must equal the constant value"));
    }
    const enumValues = object["enum"];
    if (Array.isArray(enumValues) && !enumValues.some((candidate) => equalJson(candidate, value))) {
        issues.push(issue(path, "enum", "must equal one of the allowed values"));
    }
    if (typeof value === "string")
        validateString(value, object, path, issues);
    if (typeof value === "number")
        validateNumber(value, object, path, issues);
    if (Array.isArray(value))
        validateArray(value, object, path, issues);
    if (isObject(value))
        validateObject(value, object, path, issues);
}
export function validateJsonSchema(value, schema) {
    const issues = [];
    validateInto(value, schema, "", issues);
    return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}
function queryObject(ctx) {
    const out = {};
    for (const [key, value] of ctx.url.searchParams) {
        if (!Object.hasOwn(out, key))
            out[key] = value;
        else if (Array.isArray(out[key]))
            out[key].push(value);
        else
            out[key] = [out[key], value];
    }
    return out;
}
function headerObject(ctx) {
    const out = {};
    for (const [key, value] of Object.entries(ctx.req.headers)) {
        if (value !== undefined)
            out[key.toLowerCase()] = Array.isArray(value) ? value.join(", ") : value;
    }
    return out;
}
function contentTypeAllowedValue(contentType, spec) {
    if (!spec.body || spec.contentType === undefined)
        return true;
    const parsed = parseContentType(contentType);
    const requestType = parsed?.type ?? "";
    const allowed = [spec.contentType].flat();
    return allowed.some((type) => type.toLowerCase() === requestType);
}
function validationProblem(status, title, issues) {
    return {
        status,
        type: "application/problem+json; charset=utf-8",
        cacheControl: { noStore: true },
        body: JSON.stringify({
            type: "urn:561-group:web-server:problem:request-validation",
            title,
            status,
            issues,
        }),
    };
}
function firstInvalid(entries) {
    for (const [area, value, schema] of entries) {
        if (schema === undefined)
            continue;
        const result = validateJsonSchema(value, schema);
        if (!result.valid)
            return { area, result };
    }
    return null;
}
function selectedValidated(spec, values) {
    return Object.freeze({
        ...(spec.params !== undefined ? { params: values.params } : {}),
        ...(spec.query !== undefined ? { query: values.query } : {}),
        ...(spec.headers !== undefined ? { headers: values.headers } : {}),
        ...(spec.body !== undefined ? { body: values.body } : {}),
    });
}
function validationProjection(input) {
    if (!contentTypeAllowedValue(input.contentType, input.spec)) {
        const issues = Object.freeze([
            issue("/body", "contentType", `expected ${[input.spec.contentType].flat().join(", ")}`),
        ]);
        return {
            judgments: Object.freeze([{
                    name: "request-validation:content-type",
                    value: "active",
                    reason: "request body media type was not admitted",
                    path: "/body",
                }]),
            valid: false,
            invalidArea: "contentType",
            issues,
        };
    }
    const invalid = firstInvalid([
        ["params", input.values.params, input.spec.params],
        ["query", input.values.query, input.spec.query],
        ["headers", input.values.headers, input.spec.headers],
        ["body", input.values.body, input.spec.body],
    ]);
    if (invalid) {
        return {
            judgments: Object.freeze([{
                    name: `request-validation:${invalid.area}`,
                    value: "active",
                    reason: `request ${invalid.area} did not satisfy schema`,
                    path: `/${invalid.area}`,
                }]),
            valid: false,
            invalidArea: invalid.area,
            issues: invalid.result.issues,
        };
    }
    return {
        judgments: Object.freeze([{
                name: "request-validation",
                value: "potential",
                reason: "request contract admitted observed values",
                path: "",
            }]),
        valid: true,
        invalidArea: null,
        issues: Object.freeze([]),
        validated: selectedValidated(input.spec, input.values),
    };
}
export function requestValidationJudgments(input) {
    return validationProjection(input).judgments;
}
export function requestValidationReport(input) {
    const projection = validationProjection(input);
    const settled = settleRequestTrace(input.trace, projection.judgments);
    return Object.freeze({
        trace: input.trace,
        settled,
        judgments: projection.judgments,
        valid: projection.valid,
        invalidArea: projection.invalidArea,
        issues: projection.issues,
        ...(projection.validated !== undefined ? { validated: projection.validated } : {}),
    });
}
function responseContractFor(spec, status) {
    return spec[String(status)] ?? spec[`${Math.floor(status / 100)}XX`] ?? spec[`${Math.floor(status / 100)}xx`] ?? spec.default;
}
function contentTypeMatches(contentType, allowed) {
    if (allowed === undefined)
        return true;
    const parsed = parseContentType(contentType);
    const observed = parsed?.type ?? "";
    return [allowed].flat().some((type) => type.toLowerCase() === observed);
}
function responseValidationProjection(input) {
    const contract = responseContractFor(input.spec, input.response.status);
    if (!contract) {
        const issues = Object.freeze([issue("/status", "status", `no response contract for status ${input.response.status}`)]);
        return {
            judgments: Object.freeze([{
                    name: "response-validation:status",
                    value: "active",
                    reason: "response status had no admitted contract",
                    path: "/status",
                }]),
            valid: false,
            invalidArea: "status",
            issues,
        };
    }
    if (!contentTypeMatches(input.response.contentType, contract.contentType)) {
        const issues = Object.freeze([
            issue("/contentType", "contentType", `expected ${[contract.contentType].flat().join(", ")}`),
        ]);
        return {
            judgments: Object.freeze([{
                    name: "response-validation:content-type",
                    value: "active",
                    reason: "response media type was not admitted",
                    path: "/contentType",
                }]),
            valid: false,
            invalidArea: "contentType",
            issues,
            contract,
        };
    }
    if (contract.headers !== undefined) {
        const result = validateJsonSchema(input.response.headers ?? {}, contract.headers);
        if (!result.valid) {
            return {
                judgments: Object.freeze([{
                        name: "response-validation:headers",
                        value: "active",
                        reason: "response headers did not satisfy schema",
                        path: "/headers",
                    }]),
                valid: false,
                invalidArea: "headers",
                issues: result.issues,
                contract,
            };
        }
    }
    if (contract.body !== undefined) {
        const result = validateJsonSchema(input.response.body, contract.body);
        if (!result.valid) {
            return {
                judgments: Object.freeze([{
                        name: "response-validation:body",
                        value: "active",
                        reason: "response body did not satisfy schema",
                        path: "/body",
                    }]),
                valid: false,
                invalidArea: "body",
                issues: result.issues,
                contract,
            };
        }
    }
    return {
        judgments: Object.freeze([{
                name: "response-validation",
                value: "potential",
                reason: "response contract admitted observed values",
                path: "",
            }]),
        valid: true,
        invalidArea: null,
        issues: Object.freeze([]),
        contract,
    };
}
export function responseValidationJudgments(input) {
    return responseValidationProjection(input).judgments;
}
export function responseValidationReport(input) {
    const projection = responseValidationProjection(input);
    const settled = settleRequestTrace(input.trace, projection.judgments);
    return Object.freeze({
        trace: input.trace,
        settled,
        judgments: projection.judgments,
        valid: projection.valid,
        invalidArea: projection.invalidArea,
        issues: projection.issues,
        ...(projection.contract !== undefined ? { contract: projection.contract } : {}),
    });
}
export function requestValidation(spec) {
    return async (ctx) => {
        const params = ctx.params;
        const query = queryObject(ctx);
        const headers = headerObject(ctx);
        const bodyContentType = Array.isArray(ctx.req.headers["content-type"])
            ? ctx.req.headers["content-type"][0]
            : ctx.req.headers["content-type"];
        if (!contentTypeAllowedValue(bodyContentType, spec)) {
            const report = requestValidationReport({
                trace: ctx.trace,
                spec,
                values: Object.freeze({ params, query, headers }),
                ...(bodyContentType !== undefined ? { contentType: bodyContentType } : {}),
            });
            return validationProblem(415, "Unsupported Media Type", report.issues);
        }
        const body = spec.body
            ? await readJsonBody(ctx.req, {
                empty: undefined,
                ...(spec.maxBytes !== undefined ? { maxBytes: spec.maxBytes } : {}),
                ...(bodyContentType !== undefined ? { contentType: bodyContentType } : {}),
            })
            : undefined;
        const report = requestValidationReport({
            trace: ctx.trace,
            spec,
            values: Object.freeze({ params, query, headers, body }),
            ...(bodyContentType !== undefined ? { contentType: bodyContentType } : {}),
        });
        if (!report.valid && report.invalidArea) {
            return validationProblem(400, `Invalid ${report.invalidArea}`, report.issues);
        }
        ctx.locals.validated = report.validated ?? Object.freeze({});
    };
}
function schemaParameter(name, location, schema, required = false) {
    return Object.freeze({ name, in: location, required, schema });
}
function objectProperties(schema) {
    if (!isObject(schema))
        return {};
    const properties = schema["properties"];
    if (!isObject(properties))
        return {};
    const out = {};
    for (const [key, value] of Object.entries(properties)) {
        if (typeof value === "boolean" || isObject(value))
            out[key] = value;
    }
    return out;
}
function requiredSet(schema) {
    if (!isObject(schema) || !Array.isArray(schema["required"]))
        return new Set();
    return new Set(schema["required"].filter((item) => typeof item === "string"));
}
export function validationOpenApiMetadata(spec) {
    const parameters = [];
    for (const [name, schema] of Object.entries(objectProperties(spec.params))) {
        parameters.push(schemaParameter(name, "path", schema, true));
    }
    const requiredQuery = requiredSet(spec.query);
    for (const [name, schema] of Object.entries(objectProperties(spec.query))) {
        parameters.push(schemaParameter(name, "query", schema, requiredQuery.has(name)));
    }
    const requiredHeaders = requiredSet(spec.headers);
    for (const [name, schema] of Object.entries(objectProperties(spec.headers))) {
        parameters.push(schemaParameter(name, "header", schema, requiredHeaders.has(name)));
    }
    const responses = Object.freeze({
        "400": Object.freeze({ description: "Invalid request" }),
        ...(spec.contentType !== undefined ? { "415": Object.freeze({ description: "Unsupported Media Type" }) } : {}),
    });
    return Object.freeze({
        ...(parameters.length ? { parameters: Object.freeze(parameters) } : {}),
        ...(spec.body !== undefined ? {
            requestBody: Object.freeze({
                required: true,
                content: Object.freeze(Object.fromEntries([spec.contentType ?? "application/json"].flat().map((type) => [
                    type,
                    Object.freeze({ schema: spec.body }),
                ]))),
            }),
        } : {}),
        responses,
    });
}
function responseContent(contract) {
    if (contract.body === undefined)
        return undefined;
    const body = contract.body;
    return Object.freeze(Object.fromEntries([contract.contentType ?? "application/json"].flat().map((type) => [
        type,
        Object.freeze({ schema: body }),
    ])));
}
function responseHeaders(contract) {
    return isObject(contract.headers) && isObject(contract.headers.properties)
        ? Object.freeze(Object.fromEntries(Object.entries(contract.headers.properties)
            .filter((entry) => typeof entry[1] === "boolean" || isObject(entry[1]))
            .map(([name, schema]) => [
            name,
            Object.freeze({ schema }),
        ])))
        : undefined;
}
export function responseValidationOpenApiMetadata(spec) {
    const responses = Object.freeze(Object.fromEntries(Object.entries(spec).map(([status, contract]) => [
        status,
        Object.freeze({
            description: contract.description ?? (status === "default" ? "Default response" : `HTTP ${status}`),
            ...(responseContent(contract) !== undefined ? { content: responseContent(contract) } : {}),
            ...(responseHeaders(contract) !== undefined ? { headers: responseHeaders(contract) } : {}),
        }),
    ])));
    return Object.freeze({ responses });
}
export function validatedResource(resource, validation, operation) {
    return Object.freeze({
        ...resource,
        validation,
        middlewares: Object.freeze([requestValidation(validation), ...(resource.middlewares ?? [])]),
        ...(operation !== undefined ? { openapi: operation } : {}),
    });
}
//# sourceMappingURL=validation.mjs.map