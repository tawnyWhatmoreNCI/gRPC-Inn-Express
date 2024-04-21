const PROTO_PATH = '../proto/hello.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});

const helloProto = grpc.loadPackageDefinition(packageDefinition);

const client = new helloProto.Greeter('localhost:50051', grpc.credentials.createInsecure());

module.exports = client;