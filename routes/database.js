const { Pool } = require('pg');
const { options } = require('pg/lib/defaults');
const DateTime = require('date-and-time');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'midterm' // i made a database called midterm and populated it with our seeds and schema, but i think that's local, so we might have to all create one ourselves to start??
});


 const getUserWithEmail = function(email) {
  const queryString = `SELECT users.* FROM users WHERE email=$1;`
  const values = [email];

  return pool
    .query(queryString, values)
      .then((result) => {
        return result.rows[0];
      })
      .catch((err) => {
        console.log(err.message)
      });
}

exports.getUserWithEmail = getUserWithEmail;

const getOrderData = function(username) {
  const queryString = `
  SELECT items.name as item_name, items.price, items.stock, quantity, users.name as user_name, users.phone, orders.id as order_id, order_submissions.id as order_submission_id
  FROM items
  JOIN order_submissions ON item_id = items.id
  JOIN orders ON orders.id = order_id
  JOIN users ON users.id = user_id
  WHERE order_status=$1
  AND users.name = $2;
  `;
  const values = ['Started', username]

  return pool
  .query(queryString, values)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message)
    });
}

exports.getOrderData = getOrderData;

const updateOrderStatus = function(dataArray) {

  const queryString = `
  UPDATE orders
  SET time_confirmed = $2, order_status = $3
  WHERE id=$1;
  `;
  const values = [dataArray[0].order_id, DateTime.format(new Date(), 'YYYY-MM-DD HH:mm:ss'), 'Processing']

  return pool
  .query(queryString, values)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message)
    });
};

exports.updateOrderStatus = updateOrderStatus;

const updateOrderSubmission = function(dataArray) {
  let array = [];
  for (let i=1; i<dataArray.length; i++) {
    const queryString = `
    UPDATE order_submissions
    SET quantity = $3
    WHERE order_id=$1 AND id = $2;
    `;
    const values = [Number(dataArray[0].order_id), Number(dataArray[i].id), Number(dataArray[i].quantity)]

    console.log(values);
    array.push(pool.query(queryString, values))
  }

  return Promise.all(array)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message)
    });

};

exports.updateOrderSubmission = updateOrderSubmission;

