const saveMovs = require( "./src/saveMovs.js" );
const saver = saveMovs();
const myConfig = require( "./conf.json" );

//TODO: because start is asyn, we can just treat it as a promise
saver.start( myConfig )
    .catch( console.error );