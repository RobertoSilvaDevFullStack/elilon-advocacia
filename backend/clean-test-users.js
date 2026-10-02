const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("DELETE FROM users WHERE username != 'admin'", function(err) {
    if (err) console.log('Error:', err.message);
    else console.log('Deleted ' + this.changes + ' test users');
  });

  db.all("SELECT id, username, role, approved FROM users", (err, rows) => {
    if (err) console.log('Error:', err.message);
    else console.log('Current users:', JSON.stringify(rows));
    db.close();
  });
});
