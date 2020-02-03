const { dbQuery, dbQueryAll, guildLog } = require("../coreFunctions.js");
const { release } = require("../config.json");
module.exports = async (Discord, client, guild) => {
	let qServerDB = await dbQuery("Server", { id: guild.id });
	if (qServerDB && qServerDB.blocked) {
		await guild.leave();
		return guildLog(`:no_entry: I was added to blacklisted guild **${guild.name}** (${guild.id}) and left`, client);
	}

	await guildLog(`:inbox_tray: New Guild: **${guild.name}** (${guild.id})\n>>> **Owner:** ${guild.owner.user.tag}\n**Member Count:** ${guild.memberCount}`, client);
};
