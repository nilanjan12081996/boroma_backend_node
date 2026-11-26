const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const BookingDetails = require("./booking_details.model");
const Guest = require("./guest.model");

// Define BookingPassangerList Model
const BookingPassangerList = sequelize.define(
  "BookingPassangerList",
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

    guest_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: Guest,
        key: "id",
      },
    },

    passanger_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    passanger_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    passanger_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 = active, 0 = inactive / cancelled
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
    tableName: "booking_passanger_list",
    timestamps: false,
  }
);

// Associations
BookingPassangerList.belongsTo(BookingDetails, {
  foreignKey: "booking_id",
  as: "booking",
});

BookingDetails.hasMany(BookingPassangerList, {
  foreignKey: "booking_id",
  as: "passengers",
});

BookingPassangerList.belongsTo(Guest, {
  foreignKey: "guest_id",
  as: "guest",
});

Guest.hasMany(BookingPassangerList, {
  foreignKey: "guest_id",
  as: "passengerList",
});

module.exports = BookingPassangerList;
