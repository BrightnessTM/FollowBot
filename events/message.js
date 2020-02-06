//this is a change
const fs = require("fs");
const core = require("../coreFunctions.js");
const { dbQuery, dbModifyId, dbDeleteOne, dbModify } = require("../coreFunctions");
const { emoji } = require("../config.json");
const config = require("../config.json")
module.exports = async (Discord, client, message) => {
	if (message.channel.type !== "text") {
		if (message.channel.type === "dm" && client.user.id !== message.author.id) return core.coreLog(":e_mail: **" + message.author.tag + "** (" + message.author.id + ") sent a DM to the bot:\n" + message.content, client);
		return;
	}
	if (message.author.bot === true) return;

	let permission = await core.checkPermissions(message.member, client);

	let prefix = config.prefix;

	let possiblementions = [`<@${client.user.id}> help`, `<@${client.user.id}>help`, `<@!${client.user.id}> help`, `<@!${client.user.id}>help`, `<@${client.user.id}> prefix`, `<@${client.user.id}>prefix`, `<@!${client.user.id}> prefix`, `<@!${client.user.id}>prefix`, `<@${client.user.id}> ping`, `<@${client.user.id}>ping`, `<@!${client.user.id}> ping`, `<@!${client.user.id}>ping`];
	if (possiblementions.includes(message.content.toLowerCase())) return message.reply(`Hi there! My prefix is ${Discord.escapeMarkdown(prefix)}\nYou can read more about my commands at https://suggester.gitbook.io/`);

	if (permission <= 1 && message.content.toLowerCase().startsWith("followbot:")) prefix = "followbot:";
	if (permission <= 1 && message.content.toLowerCase().startsWith(`${client.user.id}:`)) prefix = `${client.user.id}:`;
	if (!message.content.toLowerCase().startsWith(prefix)) return;
	//Only commands after this point
	//Check if message is a command
	fs.readdir("./commands/", (err, files) => {
		files.forEach(file => {
			const commandName = file.split(".")[0]; //Command to check against
			const command = require("../commands/" + commandName); //Command file
			let args = message.content.split(" ").splice(1);

			let commandText = message.content.split(" ")[0].toLowerCase().split(prefix)[1]; //Input command
			if (commandText === commandName || (command.controls.aliases && command.controls.aliases.includes(commandText))) { //Check if command matches
				if (permission > command.controls.permission) {
					core.commandLog(`🚫 ${message.author.tag} (\`${message.author.id}\`) attempted to run command \`${commandName}\` in the **${message.channel.name}** (\`${message.channel.id}\`) channel of **${message.guild.name}** (\`${message.guild.id}\`) but did not have permission to do so.`, {embeds:[{description: message.content}]});
					return message.react("🚫");
					//message.channel.send(":rotating_light: The bot is currently experiencing issues, and command usage has been locked.");
				}
				if (command.controls.enabled === false) {
					core.commandLog(`🚫 ${message.author.tag} (\`${message.author.id}\`) attempted to run command \`${commandName}\` in the **${message.channel.name}** (\`${message.channel.id}\`) channel of **${message.guild.name}** (\`${message.guild.id}\`) but the command is disabled.`, {embeds:[{description: message.content}]});
					return message.channel.send("This command is currently disabled globally.");
				}
				core.commandLog(`:wrench: ${message.author.tag} (\`${message.author.id}\`) ran command \`${commandName}\` in the **${message.channel.name}** (\`${message.channel.id}\`) channel of **${message.guild.name}** (\`${message.guild.id}\`)`, {embeds:[{description: message.content}]});

				if (command.controls.permissions) {
					let channelPermissions = message.channel.memberPermissions(client.user.id);
					let list = [];
					const permissionNames = require("../utils/permissions.json");
					command.controls.permissions.forEach(permission => {
						if (!channelPermissions.has(permission)) list.push(permissionNames[permission]);
					});
					if (list.length >= 1) {
						if (channelPermissions.has("EMBED_LINKS")) {
							//Can embed
							let embed = new Discord.RichEmbed()
								.setDescription(`This command cannot be run because some permissions are missing. ${client.user.username} needs the following permissions in the <#${message.channel.id}> channel:`)
								.addField("Missing Elements", `<:${emoji.x}> ${list.join(`\n<:${emoji.x}> `)}`)
								.addField("How to Fix", `In the channel settings for <#${message.channel.id}>, make sure that **${client.user.username}** has a <:${emoji.check}> for the above permissions.`)
								.setColor("RED");
							return message.channel.send(embed).catch(err => {
								message.author.send(`Your command \`${commandText}\` used in <#${message.channel.id}> failed to execute because <@${client.user.id}> does not have the **Send Messages** permission in that channel. Please make sure <@${client.user.id}> can send messages and try again.`);
							});
						} else {
							//Cannot embed
							return message.channel.send(`This command cannot be run because some permissions are missing. ${client.user.username} needs the following permissions in the <#${message.channel.id}> channel:\n - ${list.join("\n- ")}\nIn the channel settings for <#${message.channel.id}>, make sure that **${client.user.username}** has the following permissions allowed.`).catch(err => {
								message.author.send(`Your command \`${commandText}\` used in <#${message.channel.id}> failed to execute because <@${client.user.id}> does not have the **Send Messages** permission in that channel. Please make sure <@${client.user.id}> can send messages and try again.`);
							});
						}
					}
				}

				try {
					return command.do(message, client, args, Discord)
				} catch (err) {
					message.channel.send(`<:${emoji.x}> Something went wrong with that command, please try again later.`);
					core.errorLog(err, "Command Handler", `Message Content: ${message.content}`);
				};
			}
		});
	});
};
