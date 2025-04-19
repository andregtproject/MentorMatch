require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Konfigurasi koneksi PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Mendefinisikan model Mentor
const Mentor = sequelize.define('Mentor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expertise: {
    type: DataTypes.TEXT,
    get() {
      return this.getDataValue('expertise')?.split(';') || [];
    },
    set(val) {
      this.setDataValue('expertise', val.join(';'));
    },
  },
});

module.exports = { Mentor, sequelize };
