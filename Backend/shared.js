const mysql = require('mysql2')
const { Validator } = require('node-input-validator');

class Shared {

    static CAD = mysql.createConnection({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
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

    /**
     * Executes RCON on a FiveM Server
     * @param {string} address FiveM server IP and port.
     * @param {string} password RCON password.
     * @param {string} command Command to execute via RCON.
    */
    // static async executeRCON(address, password, command) {

    //     //Check IP
    //     const validIP = new Validator({address: address}, {
    //         address: ['ip']
    //     })       
        
    //     //Only Continue With Real IP
    //     if (await validIP.check()) {

    //         //Prevent Injection
    //         if (address.includes('192.168') || address.includes('local') || address.includes('10.0.0')) {
    //             return
    //         }

    //         //Execute Command
    //         exec(`${__dirname}/resources/icecon_linux_i386 --command "${command}" ${address} ${password}`, (error, stdout, stderr) => {
    //             console.log(stdout)
    //             if (error) {
    //                 console.log(error)
    //             } 
    //         })

    //     }

    // }

}

module.exports = Shared