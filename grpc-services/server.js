const HELLO_PROTO_PATH = '../proto/hello.proto';
const RESERVATIONS_PROTO_PATH = '../proto/reservations.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const helloPackageDef = protoLoader.loadSync(HELLO_PROTO_PATH, {});
const reservationsPackageDef = protoLoader.loadSync(RESERVATIONS_PROTO_PATH, {});

const helloProto = grpc.loadPackageDefinition(helloPackageDef);
const reservationsProto = grpc.loadPackageDefinition(reservationsPackageDef);

//functions
//basic function to demonstrate the working of gRPC and load balancing 
function sayHello(serverIndex, call, callback) {
    console.log('sayHello called');
    callback(null, { message: 'Hello ' + call.request.name });
}


// Number of servers to create
const serverCount = 3;
// starting port number for servers 
const PORT = 50051;
//creating multiple servers for distributing and load balancing
for (let i = 0; i < serverCount; i++) {
    //new server instance
    const server = new grpc.Server();
    // Add the hello service to the server
    server.addService(helloProto.Greeter.service, {
        sayHello: (call, callback) => sayHello(i, call, callback)
    });
    server.addService(reservationsProto.Reservations.service, {
        addReservation: (call, callback) => {
            console.log('addReservation called');
            callback(null, { message: 'Reservation added' });
        }
    });

    //add the reservation 

    //port includes the index
    const finalPort = PORT + i
    // Bind the server to the port, 
    server.bindAsync(`0.0.0.0:${finalPort}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Server ${i} running at 0.0.0.0:${finalPort}`);
    });
}

