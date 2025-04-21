const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') }); // Mengarahkan ke .env di folder 'models'

const { Sequelize, DataTypes } = require('sequelize');

// Log untuk debugging
console.log("DATABASE_URL:", process.env.DATABASE_URL);

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
