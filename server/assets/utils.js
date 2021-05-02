const crypto = require('crypto')

const env = {
  ID_AUTH: 0,
  EMAIL_AUTH: 1
}

/**
 * Fonction d'hachage de mot de passe. Retourne un objet contenant le salt de génération et le mdp haché
 * @param {String} password
 * @param {String} salt
 */
const hasher = (password, salt = null) => {
  if (salt === null) salt = crypto.randomBytes(Math.ceil(12 / 2)).toString('hex').slice(0, 12)
  const hash = crypto.createHmac('sha512', salt)
  hash.update(password)
  const value = hash.digest('hex')
  return {
    salt: salt,
    hashedPassword: value
  }
}

/**
 * Compare le password et le username donné à ceux attendu
 * @param {String} password
 * @param {String} email
 */
const compare = (password = null, email = null, hash = null) => {
  if (password === null || email === null || hash === null) throw new Error('Password and email are required.')
  if (typeof password !== 'string' || typeof email !== 'string' || typeof hash !== 'object') throw new Error('Password and email should be of type string.')
  const passwordData = hasher(password, hash.salt)
  if (passwordData.hashedPassword === hash.hashedPassword && email === hash.email) return true
  return false
}

const createUUID = () => {
  // http://www.ietf.org/rfc/rfc4122.txt
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}

module.exports = {
  env,
  hasher,
  compare,
  createUUID
}
