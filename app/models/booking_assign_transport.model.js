const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const BookingDetails = require("./booking_details.model");
const VehicleInfo = require("./vehicle_info.model");

// Define BookingAssignTransport Model
const BookingAssignTransport = sequelize.define(
  "BookingAssignTransport",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    booking_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: BookingDetails,
        key: "id",
      },
    },

    approved_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    approved_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    transport_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    transport_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
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
    tableName: "booking_assign_transport",
    timestamps: false,
  }
);

// Associations
BookingAssignTransport.belongsTo(BookingDetails, {
  foreignKey: "booking_id",
  as: "booking",
});

BookingDetails.hasMany(BookingAssignTransport, {
  foreignKey: "booking_id",
  as: "assignedTransports",
});

BookingAssignTransport.belongsTo(VehicleInfo, {
  foreignKey: "transport_id",
  as: "vehicle",
});

module.exports = BookingAssignTransport;
