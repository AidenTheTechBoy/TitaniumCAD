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

}

module.exports = Shared