const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/database.sqlite'
});

const Mentor = sequelize.define('Mentor', {
  name: DataTypes.STRING,
  expertise: {
    type: DataTypes.TEXT,
    get() {
      return this.getDataValue('expertise')?.split(';') || [];
    },
    set(val) {
      this.setDataValue('expertise', val.join(';'));
    }
  }
});

module.exports = { Mentor, sequelize };
