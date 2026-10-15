const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const VehicleImage = sequelize.define(
  "VehicleImage",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "vehicale_image",
    timestamps: false,
  }
);

module.exports = VehicleImage;
