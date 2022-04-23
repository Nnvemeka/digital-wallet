const axios = require('axios')
const dotenv = require('dotenv')
const { creditAccount } = require('./helpers/transactions')
const models = require('./models')

dotenv.config()

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
        

        if (charge.data.status === true) {
            await creditAccount({
                amount,
                account_id: accounId,
                purpose: 'card_funding',
                metadata: {
                    external_reference: charge.data.data.reference
                },
                t
            })
            await models.card_transactions.create({
                external_reference: charge.data.data.reference,
                created_at: new Date(),
                updated_at: new Date()
            }, { transaction: t })
        }
        await t.commit()
        return {
            success: true,
            message: 'charge successful'
        }
    } catch (error) {
        t.rollback()
        return {
            success: false,
            error: 'An error occured'
        }
    }
}

chargeCard({
    accounId: 1,
    pan: '4084084084084081',
    expiry_month: '04',
    expiry_year: '23',
    cvv: '408',
    amount: 50000,
    email: 'nnvedward@gmail.com'
}).then(console.log).catch(console.log)