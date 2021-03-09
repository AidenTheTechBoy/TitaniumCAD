const InfiniteLoop = require('infinite-loop');
const Shared = require('./shared');
const Loop = new InfiniteLoop();

// Remove Inactive Units (1 Check / 1 Minute)
Loop.add(async function() {
    let time = 5 * 60 * 1000 // Inactive For Three Minutes
    await Shared.CAD.query(`DELETE FROM units WHERE last_update + ? < ?`, [time, Date.now()])
}).setInterval(20000)
 
Loop.run()