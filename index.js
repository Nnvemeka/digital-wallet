const joi = require('joi')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const { v4 } = require('uuid')
const models = require('./models')
const { creditAccount, debitAccount } = require('./helpers/transactions')

dotenv.config()

/**
 * @param {string} username username of the user
 * @param {string} password password of the user
 */

async function createUser(username, password) {
    const schema = joi.object({
        username: joi.string().required(),
        password: joi.string().required()
    })
    const validation = schema.validate({ username, password })

    if (validation.error) {
        return {
            success: false,
            error: validation.error.details[0].message
        }
    }

    const t = await models.sequelize.transaction()

    try {
        const existingUser = await models.users.findOne({ where: { username } }, { transaction: t })
        if (existingUser) {
            return {
                success: false,
                error: 'Account already exists'
            }
        }
        const user = await models.users.create({
            username,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        }, {
            transaction: t
        })

        await models.accounts.create({
            user_id: user.id,
            balance: 4000000
        }, {
            transaction: t
        })

        await t.commit()

        return {
            success: true,
            message: 'User account created'
        }
    } catch (error) {
        await t.rollback()
        return {
            success: false,
            error: 'Internal server error'
        }
    }
}

createUser('johndoe', 'doedoe').then(console.log).catch(console.log);
createUser('johnlol', 'lololo').then(console.log).catch(console.log)