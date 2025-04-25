const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') }); // Membaca .env dari folder 'models'

const { Sequelize, DataTypes } = require('sequelize');

// Debug: cetak database URL
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

// Mendefinisikan model Mentee
const Mentee = sequelize.define('Mentee', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  interest: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('interest');
      return value ? value.split(';') : [];
    },
    set(val) {
      if (Array.isArray(val)) {
        this.setDataValue('interest', val.join(';'));
      } else {
        this.setDataValue('interest', val || '');
      }
    },
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // Bisa dijadikan foreign key nanti
  }
});

module.exports = { Mentee, sequelize };
