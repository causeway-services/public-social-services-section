function firstDefined(apps, key) {
    for (const app of apps) {
        if (app[key] !== undefined)
            return app[key];
    }
    return undefined;
}
/** Merge multiple apps into one, combining their resources, middlewares, hooks, and options. */
export function mergeApps(...apps) {
    const merged = {};
    merged.resources = apps.flatMap((a) => a.resources ?? []);
    merged.middlewares = apps.flatMap((a) => a.middlewares ?? []);
    merged.upgrades = apps.flatMap((a) => a.upgrades ?? []);
    // Lifecycle hooks: all are called in order
    const startHooks = apps.map((a) => a.onStart).filter(Boolean);
    if (startHooks.length)
        merged.onStart = async (app) => { for (const h of startHooks)
            await h(app); };
    const stopHooks = apps.map((a) => a.onStop).filter(Boolean);
    if (stopHooks.length)
        merged.onStop = async (app) => { for (const h of stopHooks)
            await h(app); };
    const connHooks = apps.map((a) => a.onConnection).filter(Boolean);
    if (connHooks.length)
        merged.onConnection = (socket) => { for (const h of connHooks)
            h(socket); };
    const lifecycles = apps.map((a) => a.lifecycle).filter(Boolean);
    if (lifecycles.length) {
        const lifecycle = {};
        const lifecycleStart = lifecycles.map((l) => l.onStart).filter(Boolean);
        if (lifecycleStart.length)
            lifecycle.onStart = async (server) => { for (const h of lifecycleStart)
                await h(server); };
        const lifecycleStop = lifecycles.map((l) => l.onStop).filter(Boolean);
        if (lifecycleStop.length)
            lifecycle.onStop = async (server) => { for (const h of lifecycleStop)
                await h(server); };
        const lifecycleConnections = lifecycles.map((l) => l.onConnection).filter(Boolean);
        if (lifecycleConnections.length)
            lifecycle.onConnection = (socket) => { for (const h of lifecycleConnections)
                h(socket); };
        merged.lifecycle = lifecycle;
    }
    const responseHooks = apps.map((a) => a.onResponse).filter(Boolean);
    if (responseHooks.length)
        merged.onResponse = async (ctx) => { for (const h of responseHooks)
            await h(ctx); };
    // onRequest: first to return truthy short-circuits
    const requestHooks = apps.map((a) => a.onRequest).filter(Boolean);
    if (requestHooks.length) {
        merged.onRequest = async (ctx) => {
            for (const h of requestHooks) {
                const result = await h(ctx);
                if (result !== false && result !== undefined && result !== null)
                    return result;
            }
        };
    }
    // onError: first provided wins
    const onError = apps.find((a) => a.onError)?.onError;
    if (onError)
        merged.onError = onError;
    // Scalar fields: first defined wins
    for (const key of ["tls", "http2", "cors", "base", "trustProxy", "cacheControl", "security", "problems"]) {
        const value = firstDefined(apps, key);
        if (value !== undefined) {
            merged[key] = value;
        }
    }
    // locals: shallow-merge, later overrides earlier
    const localsList = apps.map((a) => a.locals).filter(Boolean);
    if (localsList.length)
        merged.locals = Object.assign({}, ...localsList);
    return merged;
}
/** Apply a sequence of plugins (functions App → App) left-to-right. */
export function compose(app, ...plugins) {
    return plugins.reduce((a, p) => p(a), app);
}
//# sourceMappingURL=compose.mjs.map