const connmanFactory = require( "crossbar-connman" );
const crossbar = connmanFactory();
const mysql = require('mysql');
const fs = require('fs');

let laneConfig = {};

const iniMov = {
    acces: 0,
    moviment: 0,
    data: mov.movInfo.date, 
    client: -1,
    visita: -1,
    porta: 0,
    direccio: '',   
    matriculaLlegida: '',
    matriculaAsignada: '',
    clau: '',
    origen: 'M',        
    targetaLlegida: '',
    targetaAsignada: '',       
    ticket: '',
    resultat: 0,
    apertura: 0,
    usuariApertura: ''
}

const saveMovs = () => {

    /// Initialization of variables and structures //////////////////////////
    const movBarMov = {};

    const onNewMovement = ( name, mov ) => {
        console.log( "onNewMovement" );
        mov = JSON.parse( mov );
        Object.assign(movBarMov, iniMov);

        movBarMov.acces = laneConfig.laneInfo.establishment;
        movBarMov.moviment = mov.movInfo.id;
        movBarMov.data = mov.movInfo.date; 
        movBarMov.client = mov.movInfo.authInfo.client;
        movBarMov.visita = mov.movInfo.authInfo.visit;
        movBarMov.porta = laneConfig.laneInfo.id;
        movBarMov.direccio = laneConfig.laneInfo.direction;
        if (laneConfig.movInfo.movData.frontplate) {
            movBarMov.matriculaLlegida = laneConfig.movInfo.movData.frontplate.plate;
            movBarMov.matriculaAsignada = laneConfig.movInfo.authInfo.assignedFrontplate;
            movBarMov.clau = movBarMov.matriculaAsignada;
            movBarMov.origen = 'M';
        }
        if (laneConfig.laneInfo.movData.card) {
            movBarMov.targetaLlegida = laneConfig.movInfo.movData.card.code;
            movBarMov.targetaAsignada = laneConfig.movInfo.authInfo.assignedCard;
            if (!movBarMov.clau) {
                movBarMov.clau = movBarMov.targetaAsignada;
                movBarMov.origen = 'T';
            }
        }
        if (laneConfig.laneInfo.movData.ticket) {
            movBarMov.ticket = laneConfig.movInfo.movData.ticket.code;
            if (!movBarMov.clau) {
                movBarMov.clau = movBarMov.ticket;
                movBarMov.origen = 'I';
            }
        }
        movBarMov.resultat = mov.movInfo.authInfo.result;
        movBarMov.apertura = mov.movInfo.opening;
        movBarMov.usuariApertura = mov.movInfo.authInfo.user;

        fs.appendFileSync(laneConfig.fileName, JSON.stringify(movBarMov));

    };

    const sendMovsToDB = (mov) => { return new Promise( (resolve, reject) => {
        pool.getConnection(function(err, connection) {
            connection.query('REPLACE INTO barmov (acces, moviment, data, client, visita, '+
                    'porta, direccio, matriculaLlegida, matriculaAsignada, clau, origen, '+
                    'targetaLlegida, targetaAsignada, ticket, resultat, apertura, usuariApertura ) VALUES ?', 
                    mov,   (err, result) => {
                if (err) reject(err);
                else {
                    console.log('successfully added to DB');
                    connection.release();
                    resolve();
                }
            });
        });

    })}

    const readMovs = async function() {
        
        fs.readFile(laneConfig.fileName, (err, data) => {
            if (err) console.error;
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                await sendMovsToDB(line)
                    .then()
                    .catch(console.error)
            })
        })
        
    }


    fs.readFile(filePath, function(err, data) { // read file to memory
    if (!err) {
        data = data.toString(); // stringify buffer
        var position = data.toString().indexOf('\n'); // find position of new line element
        if (position != -1) { // if new line element found
            data = data.substr(position + 1); // subtract string based on first line length

            fs.writeFile(filePath, data, function(err) { // write file
                if (err) { // if error, report
                    console.error;
                }
            });
        } else {
            console.log('no lines found');
        }
    } else {
        console.log(err);
    }
});

    const start = async function ( config ) {

        Object.assign( laneConfig, config );

        // Initialize pool
        const pool = mysql.createPool({
            connectionLimit : 10,
            host: config.mysql.host,
            port: config.mysql.port,
            user: 'admin',
            password: 'mamen23*',
            database: config.mysql.database,
            debug:  false
        });

        await crossbar.subscribe( laneConfig.lane.host, laneConfig.lane.name + ".onNewMovement", onNewMovement )
            .then( console.log( "subscribed to lane onNewMovement" ) )
            .catch( console.error );   

        setInterval(readMovs, 5000); 

    }

    const stop = crossbar.cleanup;

    return {
        start,
        stop
    };
};

module.exports = automat;
