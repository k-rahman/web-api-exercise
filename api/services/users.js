const bcrypt = require("bcrypt");

const db = require("../db/index");
const error = require("../utils/errors");

// return all users
const getAllUsers = async _ => {
  const users = await db.query("SELECT * FROM users");

  if (users.length === 0) throw new Error("Database contains no users!");

  return users;
};

// return user by id
const getUserById = async userId => {
  const user = await db.query("SELECT * FROM users WHERE userId = ? ", userId);

  if (user.length === 0) throw error(404, "User Doesn't Exist!");

  delete user[0].password;

  return user[0];
};

// return user by email
const getUserByEmail = async email => {
  const user = await db.query("SELECT * FROM users WHERE email = ?", email);

  if (user.length === 0) throw error(404, "User Doesn't Exist!");

  return user;
};

// create new user
const createUser = async newUserData => {
  const { firstname, lastname, email, password, phone } = newUserData;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = [null, firstname, lastname, email, hashedPassword, phone];

  const user = await db.query("SELECT * FROM users WHERE email = ?", email);

  if (user.length > 0) throw error(400, "Email Already Exists!");

  return await db.query("INSERT INTO users VALUES (?)", newUser);
};

// update user
const updateUser = async (userData, userId) => {
  const { firstname, lastname, email, password, phone } = userData;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const updatedUser = [
    firstname,
    lastname,
    email,
    hashedPassword,
    phone,
    userId,
  ];

  const userEmail = await db.query(
    "SELECT email FROM users WHERE email = ? and userId <> ?",
    email,
    userId
  );

  if (userEmail.length > 0) throw error(400, "Email Already Exists!");

  await db.query(
    "UPDATE users SET firstname = ?, lastname = ?, email = ?, password = ?, phone = ? WHERE userId = ?",
    ...updatedUser
  );
};

// delete user
const deleteUser = async userId => {
  await db.query("DELETE FROM users WHERE userId = ?", userId);
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};
