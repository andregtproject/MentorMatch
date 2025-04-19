require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Konfigurasi koneksi PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
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
      const value = this.getDataValue('expertise');
      return value ? value.split(';') : [];
    },
    set(val) {
      if (Array.isArray(val)) {
        this.setDataValue('expertise', val.join(';'));
      } else {
        this.setDataValue('expertise', val || '');
      }
    },
  },
});

module.exports = { Mentor, sequelize };