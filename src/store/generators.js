/**
 * todo
 * @todo
 * @param {*} key the state prop key
 * @returns {Object} the simple mutation function
 */
function generateSimpleMutation (key) {
    return (moduleState, payload) => {
        moduleState[key] = payload;
    };
}

/**
 * todo
 * @todo
 * @param {*} key the state prop key
 * @returns {Object} the recursive mutation function
 */
function generateComplexMutation (key) {
    return (moduleState, payload) => {
        const p = key.split("/");
        let r = moduleState;

        for (let i = 0; i < p.length; i++) {
            if (i < p.length - 1) {
                r = r[p[i]];
            }
            else {
                r[p[i]] = payload;
            }
        }
    };
}

/**
 * todo
 * @todo
 * @param {*} state todo
 * @param {*} prefix todo
 * @returns {Object} the mutation function-object
 */
export function generateMutations (state, prefix = null) {
    const mutations = Object.keys(state)
        .reduce((acc, key) => {
            const _key = prefix ? prefix + "/" + key : key;
            const mutation = prefix ? generateComplexMutation(_key) : generateSimpleMutation(_key);

            if (state[key]?.constructor !== Object) {
                return {
                    ...acc,
                    [_key]: mutation
                };
            }

            return {
                ...acc,
                [_key]: mutation,
                ...generateMutations(state[key], _key)
            };

        }, {});

    return mutations;
}