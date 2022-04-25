const axios = require('axios')
const dotenv = require('dotenv')
const { creditAccount } = require('./helpers/transactions')
const models = require('./models')

dotenv.config()

function processCardPaymentResult(data) {
    switch (data.data.status) {
        case 'failed':
            return {
                success: false,
                error: data.data.data.message
            }
        case 'success':
            return {
                success: true,
                shouldCreditAccount: true,
                message: data.data.data.message
            }
        default:
            return {
                success: true,
                shouldCreditAccount: false,
                message: data.data.data.status
            }
    }
}

async function submitPin({
    reference, pin
}) {
    const charge = await axios.post('https://api.paystack.co/charge/submit_pin', {
        reference, pin
    }, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    })
    if (charge.data.data.status === 'success') {
        return {
            success: true,
            message: 'Charge successful',
            shouldCreditAccount: true
        }
    }
    return {
        success: true,
        message: charge.data.data.message,
        shouldCreditAccount: false
    }
}

async function chargeCard({
    accounId, pan, expiry_month, expiry_year, cvv, email, amount
}) {
    const t = await models.sequelize.transaction()

    try {
        const charge = await axios.post('https://api.paystack.co/charge', {
            card: {
                number: pan,
                cvv,
                expiry_year,
                expiry_month
            },
            email,
            amount
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })

        const nextAction = processCardPaymentResult(charge)

        await models.card_transactions.create({
            external_reference: charge.data.data.reference,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction: t })

        if (!nextAction.success) {
            await t.rollback()
            return {
                success: nextAction.success,
                error: nextAction.error
            }
        }
        if (nextAction.shouldCreditAccount) {
            await creditAccount({
                amount,
                account_id: accounId,
                purpose: 'card_funding',
                metadata: {
                    external_reference: charge.data.data.reference
                },
                t
            })

            await t.commit()
            return {
                success: true,
                message: 'charge successful'
            }
        }
        if (nextAction.message === 'send_pin') {
            const result = await submitPin({
                accounId,
                reference: charge.data.data.reference,
                amount,
                pin: '1111'
            })
            if (!result.success) {
                await t.rollback()
                return {
                    success: false,
                    error: result.error
                }
            }
            if (result.shouldCreditAccount) {
                await creditAccount({
                    amount,
                    account_id: accounId,
                    purpose: 'card_funding',
                    metadata: {
                        external_reference: charge.data.data.reference
                    },
                    t
                })
    
                await t.commit()
                return {
                    success: true,
                    message: 'charge successful'
                }
            }
            return {
                success: true,
                message: 'There are more validations needed'
            }
        }
        return {
            success: true,
            message: 'We should not get here!'
        }
    } catch (error) {
        t.rollback()
        return error
    }
}

// chargeCard({
//     accounId: 1,
//     pan: '507850785078507812',
//     expiry_month: '04',
//     expiry_year: '23',
//     cvv: '081',
//     amount: 10000,
//     email: 'nnvedward@gmail.com'
// }).then(console.log).catch(console.log)

// submitPin({
//     accounId: 1,
//     reference: 'uhtndxy19vvxryz',
//     amount: 10000,
//     pin: '1111'
// }).then(console.log).catch(console.log)