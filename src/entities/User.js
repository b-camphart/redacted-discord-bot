exports.User = class User {
    /** @type {string | undefined} */
    id;

    /**
     *
     * @param {object} init
     * @param {string | undefined} init.id
     */
    constructor({ id = undefined } = { id: undefined }) {
        this.id = id;
    }
};
