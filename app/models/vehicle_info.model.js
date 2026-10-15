const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const VehicleInfo = sequelize.define(
  "VehicleInfo",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vehicle_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    no_of_seat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "vehicle_info",
    timestamps: false,
  }
);

module.exports = VehicleInfo;
