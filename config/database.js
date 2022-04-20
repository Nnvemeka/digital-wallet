const dotenv = require('dotenv')

dotenv.config()

module.exports = {
    development: {
        host: process.env.DATABASE_HOST,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        dialect: 'mysql',
        define: {
            timestamps: true,
            underscored: true
        },
        logQuertParameters: true,
        logging: (str) => (process.env.SHOW_SQL_LOG ? console.log(`[SEQUELIZE DATABASE] ${str}`) : null)
    }
}