const mysql = require('mysql2')

class Shared {

    static CAD = mysql.createConnection({
        host: 'localhost',
        user: 'test',
        database: 'cad',
    }).promise()

    static Config = {
        url: process.env.FRONTEND_URL
    }

    /**
     * Checks if A Member Actually Owns A Specified Civilian
     * @param {string} member_id 
     * @param {string} civilian_id 
     */
    static async DoesMemberOwnCivilian(member_id, civilian_id) {
        const res = await this.CAD.query(`SELECT id FROM civilians WHERE id = ? AND member_id = ?`, [civilian_id, member_id])
        return res[0].length > 0
    }

    /**
     * Validates Data Entry
     * @param {Array} entries 
     * @param {Array<Array>} valid 
     * @returns {boolean} Returns true if all entries are valid.
     */
    static ValidateMultiple(entries, valid) {
        for (const i in entries) {
            const isValid = this.ValidateEntry(entries[i], valid[i])
            if (!isValid) {
                return false
            }
        }
        return true
    }

    /**
     * Validates Data Entry
     * @param {string | number} entry 
     * @param {Array} valid 
     * @returns {boolean} Returns true if entry is valid.
     */
    static ValidateEntry(entry, valid) {
        if (valid.includes(entry)) {
            return true
        }
        return false
    }

}

module.exports = Shared