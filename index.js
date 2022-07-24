import { Client, GatewayIntentBits, EmbedBuilder, GuildChannel, ChatInputCommandInteraction } from "discord.js";

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
    client.user.setPresence("Watching for new bounties...");
    client.user.setStatus("online");
    setInterval(() => {
        client.user.setPresence("Watching for new bounties...");
        client.user.setStatus("online");
    }, 10000);
});

// process.on("unhandledRejection", () => {});
// process.on("uncaughtException", () => {});

let names = [];
let locations = [];
let descriptions = [];
let images = [];
let channels = [];

/**
 * 
 * @param {string} content 
 * @param {GuildChannel} channel
 * @returns 
 */

function msgCreate(content, channel) {
    if (names.length === 0 || locations.length === 0 || descriptions.length === 0 || images.length === 0) {
        if (names.length === 0) {
            channel.send("Please add at least one name. `bas-addname <name>`");
        } else if (locations.length === 0) {
            channel.send("Please add at least one location. `bas-addloc <location>`");
        } else if (descriptions.length === 0) {
            channel.send("Please add at least one description. `bas-adddesc <description>`");
        } else if (images.length === 0) {
            channel.send("Please add at least one image link. `bas-addimage <image>`");
        }

        return;
    }

    let parameters = content.split(' ').splice(1, 1);
    let rep = ["None", "Reputation 3+", "Reputation 4+"][Math.floor(Math.random() * 3)];

    let reward;
    switch (rep) {
        case "None":            reward = Math.round(Math.random() * (40 - 10 ) + 10); break;
        case "Reputation 3+":   reward = Math.round(Math.random() * (100 - 30) + 30); break;
        case "Reputation 4+":   reward = Math.round(Math.random() * (100 - 50) + 50); break;
        
    }

    let embed = new EmbedBuilder()
    .setTitle("New Bounty")
    .setColor("#ff0000")
    .addFields(
        { 
            name: "Name",
            value: names[Math.floor(Math.random() * names.length)]
        },
        {
            name: "Reputation Lock",
            value: rep
        },
        {
            name: "Description",
            value: descriptions[Math.floor(Math.random() * descriptions.length)]
        },
        {
            name: "Last Seen",
            value: locations[Math.floor(Math.random() * locations.length)]
        },
        {
            name: "Reward",
            value: `$${reward}`
        }
    )
    .setImage(images[Math.floor(Math.random() * images.length)])
    .setDescription(`<@&${channel.guild.roles.cache.find((role) => role.name === "Guild Member")?.id || "Guild Member"}>`)

    if (parameters.length !== 0) {
        for (let obj of parameters) {
            let item = obj.split(':');
            embed.addFields({ name: item[0], value: item[1] });
        }
    }
    
    channel.send({ embeds: [embed], content: `<@&${channel.guild.roles.cache.find((role) => role.name === "Guild Member")?.id || "Guild Member"}>` })
}

setInterval(() => {
    for (let channel of channels) {
        msgCreate("", channel)
    }
}, Math.floor(Math.random() * ((1000 * 60 * 60 * 24 * 7) - (1000 * 60 * 60 * 24 * 3)) + (1000 * 60 * 60 * 24 * 3)));
// }, 10000);

client.on("messageCreate", async (message) => {
    
    if (!message.content.startsWith("bas-")) { return }
    if (
        message.author.id === "248324194436251658" ||
        message.member.roles.cache.some((role) => role.name === "Taskmaster")
    ) {
        const content = message.content.split(RegExp(/^bas-/))[1];
        let command = content.split(' ').shift();

        switch (command) {
            //NAMES
            case "addname": {
                if (content.split(' ').length === 1) { message.reply("Please provide a name to add to the list."); return; }
                let name = content.split(' ').slice(1).join(' ');
                names.push(name);
                message.reply(`Added "${name}" to the possible names list`);
                return;
            }
            case "remname": {
                if (content.split(' ').length === 1) { message.reply("Please provide a name to remove from the list."); return; }
                let name = content.split(' ').slice(1).join(' ');
                if (names?.some((n) => n === name)) {
                    names.splice(names.indexOf(name), 1);
                    message.reply(`Removed "${name}" from possible names list`);
                } else {
                    message.reply(`Could not find "${name}" in names list`);
                }
                return;
            }
            case "listnames": {
                message.reply(names.length !== 0 ? "Names: " + JSON.stringify(names.length > 1 ? names.join(', ') : names.join()) : "No names currently in list.");
                return;
            }

            //LOCATION
            case "addloc": {
                if (content.split(' ').length === 1) { message.reply("Please provide a location to add to the location list."); return; }
                let loc = content.split(' ').slice(1).join(' ');
                locations.push(loc);
                message.reply(`Added "${loc}" to the possible locations list`);
                return;
            }
            case "remloc": {
                if (content.split(' ').length === 1) { message.reply("Please provide a location to remove from the location list."); return; }
                let loc = content.split(' ').slice(1).join(' ');
                if (locations?.some((n) => n === loc)) {
                    locations.splice(locations.indexOf(loc), 1);
                    message.reply(`Removed "${loc}" from possible locations list`);
                } else {
                    message.reply(`Could not find "${loc}" in locations list`);
                }
                return;
            }
            case "listlocs": {
                message.reply(locations.length !== 0 ? "Locations: " + JSON.stringify(locations.length > 1 ? locations.join(', ') : locations.join()) : "No locations currently in list.");
                return;
            }

            //DESCRIPTION
            case "adddesc": {
                if (content.split(' ').length === 1) { message.reply("Please provide a description."); return; }
                let desc = content.split(' ').slice(1).join(' ');
                descriptions.push(desc);
                message.reply("Description added");
                return;
            }
            case "remdesc": {
                if (content.split(' ').length === 1) { message.reply("Please provide a description to remove."); return; }
                let desc = content.split(' ').slice(1).join(' ');
                if (descriptions?.some((n) => n === desc)) {
                    descriptions.splice(descriptions.indexOf(desc), 1);
                    message.reply(`Removed "${desc}" from possible description list`);
                } else {
                    message.reply(`Could not find "${desc}" in description list`);
                }
                return;
            }
            case "listdescs": {
                message.reply(descriptions.length !== 0 ? "Descriptions: " + JSON.stringify(descriptions.length > 1 ? descriptions.join(', ') : descriptions.join()) : "No descriptions currently in list.");
                return;
            }

            //IMAGES
            case "addimage": {
                if (content.split(' ').length === 1) { message.reply("Please provide a link to add to the image list."); return; }
                if (images?.some((img) => img === image)) { message.reply("This image is already in the list."); return; }
                let image = content.split(' ').slice(1).join(' ')
                images.push(image);
                message.reply(`Added "${image}" to the possible image list`);
                return;
            }
            case "remimage": {
                if (content.split(' ').length === 1) { message.reply("Please provide a link to remove."); return; }
                let image = content.split(' ').slice(1).join(' ');
                if (images?.some((n) => n === image)) {
                    images.splice(images.indexOf(image), 1);
                    message.reply(`Removed "${image}" from possible images list`);
                } else {
                    message.reply(`Could not find "${image}" in images list`);
                }
                return;
            }
            case "listimage": {
                message.reply(images.length !== 0 ? "Image links: \"" + images.join(' ') : "No image links in cache.");
                return;
            }

            //MAIN COMMANDS
            case "enable": {
                if (!channels.some((channel) => channel.id === message.channel.id)) {
                    channels.push(message.channel);
                    message.reply(`Added ${message.channel.name} to the system list.`);
                }
                break;
            }
            case "disable": {
                if (channels.some((channel, index) => {
                    if (channel.id === message.channel.id) {
                        channels.splice(index, 1);
                        return true;
                    }
                }))
                message.reply(`Removed ${message.channel.name} from the system list.`);
                break;
            }
            case "listenabled": {
                message.reply(channels.map((channel) => `"${channel.name}"`).join(' ') || "No channels currently enabled");
                break;
            }
            case "create": {
                msgCreate(content, message.channel);
                break;
            }
            case "help": {
                message.reply("To use the bot, first make sure the lists are pupulated using their respective commands: bas-addname, bas-adddesc, bas-addloc, bas-addimage");
            }
        }
    }
})

client.login(process.env.TOKEN);