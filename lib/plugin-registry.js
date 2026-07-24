function createPluginRegistry(coreModuleIds = []) {
  const plugins = new Map();
  const reservedModules = new Set(coreModuleIds);

  function register(plugin) {
    if (!plugin || typeof plugin !== 'object') throw new TypeError('Plugin inválido');
    if (!/^[a-z][a-z0-9-]*$/.test(plugin.id || '')) throw new TypeError('ID de plugin inválido');
    if (plugins.has(plugin.id)) throw new Error(`Plugin duplicado: ${plugin.id}`);
    if (!plugin.module || !/^[a-z][a-z0-9-]*$/.test(plugin.module.id || '')) throw new TypeError('Módulo do plugin inválido');
    if (reservedModules.has(plugin.module.id) || [...plugins.values()].some(item => item.module.id === plugin.module.id)) throw new Error(`Módulo duplicado: ${plugin.module.id}`);
    if (!Array.isArray(plugin.tracks) || !Array.isArray(plugin.labs)) throw new TypeError('Plugin deve fornecer tracks e labs');
    const trackIds = new Set(plugin.tracks.map(track => track.id));
    if (trackIds.size !== plugin.tracks.length || plugin.tracks.some(track => track.module !== plugin.module.id)) throw new TypeError('Trilhas do plugin inválidas');
    if (plugin.labs.some(lab => lab.module !== plugin.module.id || !trackIds.has(lab.track))) throw new TypeError('Labs do plugin inválidos');
    if (plugin.handle && typeof plugin.handle !== 'function') throw new TypeError('Handler do plugin inválido');
    plugins.set(plugin.id, Object.freeze({ ...plugin }));
    return plugin.id;
  }

  function publicSnapshot() {
    return [...plugins.values()].map(plugin => ({
      id: plugin.id,
      module: {
        ...plugin.module,
        quiz: Array.isArray(plugin.module.quiz) ? plugin.module.quiz.map(({ correct, explanation, ...question }) => question) : [],
        finalChallenge: plugin.module.finalChallenge ? { ...plugin.module.finalChallenge, requiredLabIds: undefined } : undefined
      },
      tracks: plugin.tracks,
      labs: plugin.labs.map(({ solution, solutionPayload, hints, ...lab }) => ({ ...lab, hintCount: Array.isArray(hints) ? hints.length : Number(lab.hintCount || 0) }))
    }));
  }

  async function route(req, res, url) {
    for (const plugin of plugins.values()) {
      if (plugin.routePrefix && url.pathname.startsWith(plugin.routePrefix) && plugin.handle) return { handled: true, result: await plugin.handle(req, res, url) };
    }
    return { handled: false };
  }

  return { register, publicSnapshot, route, ids: () => [...plugins.keys()], entries: () => [...plugins.values()] };
}

module.exports = { createPluginRegistry };
