const { Sequelize, DataTypes } = require('sequelize');

// Konfigurasi koneksi PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',  
  host: 'localhost',    
  port: 5432,           
  username: 'postgres',
  password: 'IAE123',
  database: 'mentor_db',
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
