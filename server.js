const express = require('express');
const app = express();
//app.use(express.urlencoded({extended: true}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
const urlencodedParser = bodyParser.urlencoded({extended: false});

app.set('trust proxy', 1); // trust first proxy
const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));

const fs = require('fs');

const fb = require('firebird');

const dbConfigs = LoadConfig();
dbConfigs.connections = dbConfigs.connections || [];

const dbConnParams = dbConfigs.connections[0];

app.get('/', function (req, res) {
    res.redirect('/login.html');
});

app.get('/checkDbConnection', urlencodedParser, function (req, res) {
    try {
        const conn = fb.createConnection();
        conn.connect(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role, function (err) {
            const r = {
                err: err ? err.message : null,
                connected: conn.connected
            };
            res.end(JSON.stringify(r));
        });

        conn.on('error', function () {
            res.end(JSON.stringify({
                err: 'Wrong Node.js with database connection',
                connected: false
            }));
        });
    } catch (e) {
        res.end(JSON.stringify({
            err: e.message,
            connected: false
        }));
    }
});

app.post('/loginUser', urlencodedParser, function (req, res) {
    const sql = `select * from USERS US where US.NAME = lower('${req.body.username}')`;

    console.log(sql);
    console.log(req.body);
    const out = {err: true, message: "", id: -1};

    try {
        const conn = fb.createConnection();
        conn.connectSync(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role);
        const rs = conn.querySync(sql);
        const rows = rs.fetchSync("all", true);
        conn.disconnect();

        console.log(rows);
        if (rows.length === 0) {
            out.err = true;
            out.message = `user "${req.body.username}" not found`;
        } else if (rows[0].PWD !== req.body.password) {
            out.err = true;
            out.message = `wrong password`;
            out.id = 0;
        } else {
            out.err = false;
            out.message = '';
            out.id = rows[0].ID;
        }

//        res.end(JSON.stringify(out));
        if (!out.err) {
            console.log('password OK, redirecting to main page');
            req.session.user_id = out.id;
            res.redirect('/index.html');
            console.log('out json');
            res.end(JSON.stringify(out));
        } else {
            console.log(out.message);
            res.redirect('/login.html');
        }
    } catch (e) {
        out.err = true;
        out.message = e.message;
        out.id = 0;
        res.redirect('/login.html');
//        res.end(JSON.stringify(out));
    }
});

app.post('/createUser', urlencodedParser, function (req, res) {
    const sql = `select * from CREATE_USER('${req.body.username}', '${req.body.password}', '${req.body.email}')`;

    const out = {err: true, message: "", id: -1};

    try {
        const conn = fb.createConnection();
        conn.connectSync(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role);
        const rs = conn.querySync(sql);
        const rows = rs.fetchSync("all", true);
        conn.commitSync();
        conn.disconnect();

//        console.log(rows);
        if (rows[0].R_ID > 0) {
            out.err = false;
            out.message = ``;
            out.id = rows[0].R_ID;
            req.session.user_id = rows[0].R_ID;
        } else {
            out.err = true;
            out.message = `user with name "${req.body.username}" already exists`;
            out.id = rows[0].ID;
        }

//        res.end(JSON.stringify(out));
        res.redirect('/index.html');
    } catch (e) {
        out.err = true;
        out.message = e.message;
        out.id = 0;
//        res.end(JSON.stringify(out));
        res.redirect('/signup.html');
    }
});

// возвран полного списка строк для текущего юзера
app.post('/refreshAllEntries', urlencodedParser, function (req, res) {
    const sql = `select * from PERSONS where ID_USER = ${req.session.user_id}`;

    console.log(sql);
    const out = {err: false, message: "", id: -1, rows: []};
    try {
        const conn = fb.createConnection();
        conn.connectSync(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role);
        const rs = conn.querySync(sql);
        out.rows = rs.fetchSync("all", true);
        conn.commitSync();
        conn.disconnect();
        console.log(out);
        res.end(JSON.stringify(out));
    } catch (e) {
        out.err = true;
        out.message = e.message;
        out.id = 0;
        res.end(JSON.stringify(out));
    }
});

// добавление новой строки записи в Базу данных для Юзера
app.post('/addNewEntry', urlencodedParser, function (req, res) {
    console.log(req.body);
    // Выподняем SQL запрос для добавдения строки используя
    // req.body.userID, req.body.id, req.body.fName, req.body.lName, req.body.age
    const sql = `insert into PERSONS (ID, ID_USER, FNAME, LNAME, AGE) values (${req.body.id}, ${req.session.user_id}, '${req.body.fName}', '${req.body.lName}', ${req.body.age})`;

    console.log(sql);
    console.log(req.body);
    const out = {err: true, message: "", id: -1};

    try {
        const conn = fb.createConnection();
        conn.connectSync(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role);
        conn.querySync(sql);
        conn.commitSync();
        conn.disconnect();

        out.err = false;
        out.message = '';
        out.id = 0;

        res.end(JSON.stringify(out));
//        res.redirect('/index.html');
    } catch (e) {
        out.err = true;
        out.message = e.message;
        out.id = 0;
        res.end(JSON.stringify(out));
//        res.redirect('/index.html');
    }
});

// Update строки записи в Базу данных для Юзера
app.post('/updateEntry', urlencodedParser, function (req, res) {
    console.log(req.body);
    // Выподняем SQL запрос для обновления строки используя
    // req.body.userID, req.body.id, req.body.fName, req.body.lName, req.body.age
    const sql = `update PERSONS set FNAME = '${req.body.fName}', LNAME = '${req.body.lName}', AGE = ${req.body.age} where ID = ${req.body.id} and ID_USER = ${req.session.user_id}`;

    console.log(sql);
    console.log(req.body);
    const out = {err: true, message: "", id: -1};

    try {
        const conn = fb.createConnection();
        conn.connectSync(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role);
        conn.querySync(sql);
        conn.commitSync();
        conn.disconnect();

        out.err = false;
        out.message = '';
        out.id = 0;

        res.end(JSON.stringify(out));
//        res.redirect('/index.html');
    } catch (e) {
        out.err = true;
        out.message = e.message;
        out.id = 0;
        res.end(JSON.stringify(out));
//        res.redirect('/index.html');
    }
});

// Remove строки записи в Базу данных для Юзера
app.post('/removeEntry', urlencodedParser, function (req, res) {
    console.log(req.body);
    // Выподняем SQL запрос для удаления строки используя
    // req.body.userID, req.body.id
    const sql = `delete from PERSONS where ID = ${req.body.id} and ID_USER = ${req.session.user_id}`;

    console.log(sql);
    console.log(req.body);
    const out = {err: true, message: "", id: -1};

    try {
        const conn = fb.createConnection();
        conn.connectSync(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role);
        conn.querySync(sql);
        conn.commitSync();
        conn.disconnect();

        out.err = false;
        out.message = '';
        out.id = 0;

        res.end(JSON.stringify(out));
//        res.redirect('/index.html');
    } catch (e) {
        out.err = true;
        out.message = e.message;
        out.id = 0;
        res.end(JSON.stringify(out));
//        res.redirect('/index.html');
    }
});
// Очистить  записи в Базе данных для Юзера
app.post('/clearEntry', urlencodedParser, function (req, res) {
    console.log(req.body);
    // Выподняем SQL запрос для очистки таблички используя
    // req.body.userID,
    const sql = `delete from PERSONS where ID_USER = ${req.session.user_id }`;

    console.log(sql);
    console.log(req.body);
    const out = {err: true, message: "", id: -1};

    try {
        const conn = fb.createConnection();
        conn.connectSync(dbConnParams.database, dbConnParams.user, dbConnParams.password, dbConnParams.role);
        conn.querySync(sql);
        conn.commitSync();
        conn.disconnect();

        out.err = false;
        out.message = '';
        out.id = 0;
        res.end(JSON.stringify(out));
    } catch (e) {
        out.err = true;
        out.message = e.message;
        out.id = 0;
//        res.json(out);
        res.end(JSON.stringify(out));
    }
//    res.redirect('/index.html');
});

app.use(express.static(__dirname + '/public'));

const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

function LoadConfig() {
    let cfg = {};
    try {
        fs.statSync(__dirname + '/cfg/cfg.json');
        const sCfg = fs.readFileSync(__dirname + '/cfg/cfg.json', 'utf8');
        cfg = JSON.parse(sCfg);
    } catch (e) {
        console.log("Error loading config " + e.message)
    }
    return cfg;
}
