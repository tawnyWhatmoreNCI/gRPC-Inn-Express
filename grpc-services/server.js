const HELLO_PROTO_PATH = '../proto/hello.proto';
const RESERVATIONS_PROTO_PATH = '../proto/reservations.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const reservationsPackageDef = protoLoader.loadSync(RESERVATIONS_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const reservationsProto = grpc.loadPackageDefinition(reservationsPackageDef);


/***********
 * Dummy Data
 ***********/
//mimics the data from a database
const dummy_reservation_data = [
    {
        reservation_id: "1",
        guest_name: 'John Doe',
        room_number: 101,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-03',
        room_type: 'SINGLE',
        status: 'CHECKED_IN'
    },
    {
        reservation_id: "2",
        guest_name: 'Jane Doe',
        room_number: 14,
        check_in_date: '2021-09-11',
        check_out_date: '2021-09-25',
        room_type: 'DOUBLE',
        status: 'CONFIRMED'
    },
    {
        reservation_id: "3",
        guest_name: 'John Smith',
        room_number: 611,
        check_in_date: '2021-06-01',
        check_out_date: '2021-06-03',
        room_type: 'SINGLE',
        status: 'CANCELLED'
    },
    {
        reservation_id: "4",
        guest_name: 'Cindy Lou Who',
        room_number: 103,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-030',
        room_type: 'SINGLE',
        status: 'CONFIRMED'
    },
    {
        reservation_id: "5",
        guest_name: 'Limbo Jones',
        room_number: 78,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-03',
        room_type: 'SINGLE',
        status: 'PENDING'
    },
    {
        reservation_id: "6",
        guest_name: 'Tommy Bahama',
        room_number: 3,
        check_in_date: '2021-05-01',
        check_out_date: '2021-05-13',
        room_type: 'SINGLE',
        status: 'CHECKED_OUT'
    },
];

/**********
 * Functions
 **********/
function makeReservation(serverIndex, call, callback) {
    console.log('makeReservation called by servers', serverIndex);
    const reservation = call.request.reservation;
    dummy_reservation_data.push(reservation);
    callback(null, { reservation, message: 'Reservation created successfully' });
}

function modifyReservation(serverIndex, call, callback) {
    console.log('ModifyReservation called by servers', serverIndex);
    const reservation = call.request;
    console.log('Reservation to modify:', reservation);
    // Find the reservation to modify
    const index = dummy_reservation_data.findIndex(r => r.reservation_id === reservation.reservation_id);
    if (index < 0) {
        callback({code: grpc.status.NOT_FOUND, message: 'Reservation for modifying not found' });
    } else {
        dummy_reservation_data[index] = reservation;
        callback(null, { reservation: reservation, message: 'Reservation modified successfully' });
    }
}

function cancelReservation(serverIndex, call, callback) {
    console.log('CancelReservation called by servers', serverIndex);
    const reservationId = call.request.reservation_id;
    //find the reservation to cancel 
    const index = dummy_reservation_data.findIndex(r => r.reservation_id === reservationId);
    if (index < 0) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Reservation not found for id: ' +  reservationId });
    } else {
        dummy_reservation_data.splice(index, 1);
        callback(null, { message: 'Reservation cancelled successfully' });
    }
}

function getReservation(serverIndex, call, callback) { 
    const reservationId = call.request.reservation_id;
    console.log('GetReservation ID: ', reservationId, ' called by servers', serverIndex);
    
    if (!reservationId) {
        callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Reservation ID is required' });
    }
    const reservation = dummy_reservation_data.find(r => r.reservation_id === reservationId);
    if (!reservation) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Reservation not found for id: ' + reservation_id });
    } else {
        callback(null, { reservation: reservation, message: 'Reservation found' });
    }
}

function getAllReservations(serverIndex, call, callback) {
    console.log('GetAllReservations called by servers', serverIndex);
    callback(null, {  reservations:dummy_reservation_data });
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

    // Add the reservations service to the server
    server.addService(reservationsProto.ReservationService.service, {
        MakeReservation: (call, callback) => makeReservation(i, call, callback),
        ModifyReservation: (call, callback) => modifyReservation(i, call, callback),
        CancelReservation: (call, callback) => cancelReservation(i, call, callback),
        GetReservation: (call, callback) => getReservation(i, call, callback),
        GetAllReservations: (call, callback) => getAllReservations(i, call, callback)
    });

    //port includes the index
    const finalPort = PORT + i
    // Bind the server to the port, 
    server.bindAsync(`0.0.0.0:${finalPort}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Server ${i} running at 0.0.0.0:${finalPort}`);
    });
}