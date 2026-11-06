const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const VehicleInfo = require("./vehicle_info.model");

// Define the VehicleRC model
const VehicleRC = sequelize.define(
  "VehicleRC",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vehical_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    document_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exp_date: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 = active, 0 = inactive
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "vehicle_rc",
    timestamps: false,
  }
);

// Associations
VehicleRC.belongsTo(VehicleInfo, { foreignKey: "vehical_id", as: "vehicle" });
VehicleInfo.hasMany(VehicleRC, { foreignKey: "vehical_id", as: "rcRecords" });

module.exports = VehicleRC;

