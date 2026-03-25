'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 🔹 STEP 3: Define associations
db.User.hasOne(db.Wallet, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Wallet.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Transaction, { foreignKey: 'senderId', as: 'sentTransactions' });
db.User.hasMany(db.Transaction, { foreignKey: 'receiverId', as: 'receivedTransactions' });
db.Transaction.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.Transaction.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });

// 🔹 Automatically call associate if exists in models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;