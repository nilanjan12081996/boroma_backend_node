const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Guest = require("./guest.model");
const Category = require("./category.model");

// Define BookingDetails Model
const BookingDetails = sequelize.define(
  "BookingDetails",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    booking_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    pickup_place: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    seat_require: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    car_type: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: Category,
        key: "id",
      },
    },

    guest_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Guest,
        key: "id",
      },
    },

    transport_type: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: Category,
        key: "id",
      },
    },

    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1 = active / confirmed, 0 = cancelled / pending
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
    tableName: "booking",
    timestamps: false,
  }
);

// Associations
BookingDetails.belongsTo(Guest, { foreignKey: "guest_id", as: "guest" });
Guest.hasMany(BookingDetails, { foreignKey: "guest_id", as: "bookings" });

// Category Associations (transport_type & car_type)
BookingDetails.belongsTo(Category, { foreignKey: "transport_type", as: "transportType" });
Category.hasMany(BookingDetails, { foreignKey: "transport_type", as: "transportBookings" });

BookingDetails.belongsTo(Category, { foreignKey: "car_type", as: "carType" });
Category.hasMany(BookingDetails, { foreignKey: "car_type", as: "carTypeBookings" });

module.exports = BookingDetails;

