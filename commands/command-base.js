const { prefix } = require('../config.json')
const Discord = require('discord.js')

const validatePermissions = (permissions) => {
  const validPermissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
  ]

  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node "${permission}"`)
    }
  }
}

let recentlyRan = [] // guildId-userId-command

const dateSet = new Set();

let dateCache = []

const clearCache = () => {
 dateCache = []
  setTimeout(clearCache, 1000 * 60 * 2) // 2 minutes
}
  clearCache()

module.exports = (client, commandOptions) => {
  let {
    commands,
    expectedArgs = '',
    permissionError = 'You do not have permission to run this command.',
    minArgs = 0,
    maxArgs = null,
    cooldown = -1,
    permissions = [],
    requiredRoles = [],
    callback,
  } = commandOptions

  // Ensure the command and aliases are in an array
  if (typeof commands === 'string') {
    commands = [commands]
  }

 // console.log(`Registering command "${commands[0]}"`)

  // Ensure the permissions are in an array and are all valid
  if (permissions.length) {
    if (typeof permissions === 'string') {
      permissions = [permissions]
    }

    validatePermissions(permissions)
  }

  // Listen for messages
  client.on('message', (message) => {

    if (message.channel.type == "dm") return;

    const { member, content, guild } = message

    for (const alias of commands) {
      if (
        content.toLowerCase().split(' ')[0] === (`${prefix}${alias.toLowerCase()}`)
      ) {
        // A command has been ran
 
        // Ensure the user has the required permissions
        for (const permission of permissions) {
          if (!member.hasPermission(permission)) {
            message.reply(permissionError)
            return
          }
        }

        // Ensure the user has the required roles
        for (const requiredRole of requiredRoles) {
          const role = guild.roles.cache.find(
            (role) => role.name === requiredRole
          )

          if (!role || !member.roles.cache.has(role.id)) {
            message.reply(
              `You must have the "${requiredRole}" role to use this command.`
            )
            return
          }
        }

// Ensure the user has not ran this command too frequently
        //guildId-userId-command
        let cooldownString = `${guild.id}-${member.id}-${commands[0]}`

        if (cooldown > 0 && recentlyRan.includes(cooldownString)) {

          timeLeft = Math.round(cooldown-(((new Date()).getTime() - callTime )/1000))

          cdembed = new Discord.MessageEmbed()
          .setTitle('❄️ Cooldown ❄️')
          .setColor('RANDOM')
          .setThumbnail('https://i.imgur.com/5eJmCkg.gif')
          .setDescription(`Wait! You can use **${commands[0]}** in **${timeLeft}** seconds.`)
          .setTimestamp()
          .setFooter(message.author.username, message.author.displayAvatarURL({ format: 'png', size: 256, dynamic: true }));

           message.channel.send(cdembed)
          
           return
        }

        // Split on any number of spaces
        const arguments = content.split(/[ ]+/)

        // Remove the command which is the first index
        arguments.shift()

        // Ensure we have the correct number of arguments
        if (
          arguments.length < minArgs ||
          (maxArgs !== null && arguments.length > maxArgs)
        ) {
          message.reply(
            `Incorrect syntax! Use ${prefix}${alias} ${expectedArgs}`
          )
          return
        }

        if (cooldown > 0) {
          recentlyRan.push(cooldownString)
          callTime = (new Date()).getTime();
            dateCache.push(callTime)
          setTimeout(() => {
            recentlyRan = recentlyRan.filter((string) => {
              return string !== cooldownString
               }) 
          }, 1000 * cooldown)
      }
        // Handle the custom command code
        callback(message, arguments, arguments.join(' '), client)
        return

      }
    }
  })
}