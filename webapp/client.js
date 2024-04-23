const PROTO_PATH = '../proto/reservations.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const reservationsProto = grpc.loadPackageDefinition(packageDefinition);

function makeClient(address) {
    console.log(`Talking to server at address: ${address}`);
    const client =  new reservationsProto.ReservationService(address, grpc.credentials.createInsecure());
    //return as tuple so have access to address
    return [client, address];
}

  const client1 = makeClient('localhost:50051');
  const client2 = makeClient('localhost:50052');
  const client3 = makeClient('localhost:50053');

//export all client insstance 
module.exports = [client1, client2, client3];