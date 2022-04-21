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

// createUser('prime', 'xxxxxx').then(console.log).catch(console.log);

/**
 * @param {number} account_id account_id of the account
 * @param {number} amount amount to deposit
 */

 async function deposit(account_id, amount) {
    const schema = joi.object({
      account_id: joi.number().required(),
      amount: joi.number().min(1).required(),
    });

    const validation = schema.validate({ account_id, amount })

    if (validation.error) {
      return {
        success: false,
        error: validation.error.details[0].message,
      };
    }
    const t = await models.sequelize.transaction()

    try {
      const creditResult = await creditAccount({
        account_id,
        amount,
        purpose: 'deposit',
        t,
      });
  
      if (!creditResult.success) {
        await t.rollback();
        return creditResult;
      }
  
      await t.commit();
      return {
        success: true,
        message: 'deposit successful',
      };
    } catch (error) {
      await t.rollback();
      return {
        success: false,
        error: 'An error occured',
      };
    }
  }
  

// deposit(3,2000).then(console.log).catch(console.log)

/**
 * @param {number} account_id account_id of the account
 * @param {number} amount amount to withdraw
*/
async function withdraw(account_id, amount) {
    const schema = joi.object({
      account_id: joi.number().required(),
      amount: joi.number().min(1).required(),
    });
    const validation = schema.validate({ account_id, amount })

    if (validation.error) {
      return {
        success: false,
        error: validation.error.details[0].message,
      };
    }
    const t = await models.sequelize.transaction()

    try {
      const debitResult = await debitAccount({
        account_id,
        amount,
        purpose: 'withdrawal',
        t,
      });
  
      if (!debitResult.success) {
        await t.rollback();
        return debitResult;
      }
  
      await t.commit();
      return {
        success: true,
        message: 'Withdrawal successful',
      };
    } catch (error) {
      await t.rollback();
      return {
        success: false,
        error: 'An error occured',
      };
    }
  }

//   withdraw(3, 2000).then(console.log).catch(console.log)

/**
 * @param {number} sender_id account_id of the sender
 * @param {number} recipient_id account_id of the recipient
 * @param {number} amount amount to deposit
 */

async function transfer(sender_id, recipient_id, amount) {
    const schema = joi.object({
        sender_id: joi.number().required(),
        recipient_id: joi.number().required(),
        amount: joi.number().min(1).required()
    })

    const validation = schema.validate({ sender_id, recipient_id, amount })
    if (validation.error) {
        return {
            success: false,
            error: validation.error.details[0].message
        }
    }

    const t = await models.sequelize.transaction()

    try {
        const reference = v4()
        const purpose = 'transfer'

        const transferResult = await Promise.all([
            debitAccount({
                amount,
                account_id: sender_id,
                purpose,
                reference,
                metadata: {
                    recipient_id
                },
                t
            }),
            creditAccount({
                amount,
                account_id: recipient_id,
                purpose,
                reference,
                metadata: {
                    sender_id
                }
            })
        ])

        const failedTxns = transferResult.filter((result) => !result.success)
        if (failedTxns.length) {
            await t.rollback()
            return transferResult
        }

        await t.commit()
        return {
            success: true,
            message: 'Transfer successful'
        }
    } catch (error) {
        await t.rollback()
        return {
            success: false,
            error: 'Internal server error'
        }
    }
}

transfer(2, 3, 60000).then(console.log).catch(console.log)