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
        user_id: "abc123",
        reservation_id: "1",
        guest_name: 'John Doe',
        room_number: 101,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-03',
        room_type: 'SINGLE',
        status: 'CHECKED_IN'
    },
    {
        user_id: "abc123",
        reservation_id: "2",
        guest_name: 'Jane Doe',
        room_number: 14,
        check_in_date: '2021-09-11',
        check_out_date: '2021-09-25',
        room_type: 'DOUBLE',
        status: 'CONFIRMED'
    },
    {
        user_id: "abc123",
        reservation_id: "3",
        guest_name: 'John Smith',
        room_number: 611,
        check_in_date: '2021-06-01',
        check_out_date: '2021-06-03',
        room_type: 'SINGLE',
        status: 'CANCELLED'
    },
    {
        user_id: "xyz098",
        reservation_id: "4",
        guest_name: 'Cindy Lou Who',
        room_number: 103,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-030',
        room_type: 'SINGLE',
        status: 'CONFIRMED'
    },
    {
        user_id: "bnm456",
        reservation_id: "5",
        guest_name: 'Limbo Jones',
        room_number: 78,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-03',
        room_type: 'SINGLE',
        status: 'PENDING'
    },
    {
        user_id: "abc123",
        reservation_id: "6",
        guest_name: 'Tommy Bahama',
        room_number: 3,
        check_in_date: '2021-05-01',
        check_out_date: '2021-05-13',
        room_type: 'SINGLE',
        status: 'CHECKED_OUT'
    },
    {
        user_id: "xyz098",
        reservation_id: "7",
        guest_name: 'Cindy Lou Who',
        room_number: 103,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-30',
        room_type: 'SINGLE',
        status: 'CONFIRMED'
    },
    {
        user_id: "bnm456",
        reservation_id: "8",
        guest_name: 'Limbo Jones',
        room_number: 78,
        check_in_date: '2021-08-01',
        check_out_date: '2021-08-03',
        room_type: 'SINGLE',
        status: 'PENDING'
    },
    {
        user_id: "abc123",
        reservation_id: "9",
        guest_name: 'Tommy Bahama',
        room_number: 3,
        check_in_date: '2021-05-01',
        check_out_date: '2021-05-13',
        room_type: 'SINGLE',
        status: 'CHECKED_OUT'
    }
];

/**********
 * Functions
 **********/

//create new reservation
function makeReservation(serverIndex, call, callback) {
    console.log('makeReservation called by servers', serverIndex);
    const user_id = call.request.user_id;
    //create new reservation id for this reservation
    const reservation_id = (dummy_reservation_data.length + 1).toString();
    const guest_name = call.request.guest_name;
    //assign a room number based on the room type, using some dummy conditional logic 
    const room_type = call.request.room_type;
    let room_number;
    //assign room number to a random value within a range based on the roomtype
    if (room_type === 'SINGLE') {
        room_number = Math.floor(Math.random() * 100) + 1;
    } else if (room_type === 'DOUBLE') {
        room_number = Math.floor(Math.random() * 100) + 101;
    } else if (room_type === 'FAMILY') {
        room_number = Math.floor(Math.random() * 100) + 201;
    } else {
        room_number = Math.floor(Math.random() * 100) + 301;
    }

    const check_in_date = call.request.check_in_date;
    const check_out_date = call.request.check_out_date;
    const status = 'CONFIRMED';
    const reservation = {
        user_id: user_id,
        reservation_id: reservation_id,
        guest_name: guest_name,
        room_number: room_number,
        check_in_date: check_in_date,
        check_out_date: check_out_date,
        room_type: room_type,
        status: status
    };
    dummy_reservation_data.push(reservation);
    callback(null, { reservation: reservation, message: 'Reservation made successfully' });

}

//modify existing reservation
function modifyReservation(serverIndex, call, callback) {
    console.log('ModifyReservation called by servers', serverIndex);
    const reservation = call.request;
    console.log('Reservation to modify:', reservation);
    // Find the reservation to modify
    const index = dummy_reservation_data.findIndex(r => r.reservation_id === reservation.reservation_id);
    if (index < 0) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Reservation for modifying not found' });
    } else {
        dummy_reservation_data[index] = reservation;
        callback(null, { reservation: reservation, message: 'Reservation modified successfully' });
    }
}

//cancel existing reservation
function cancelReservation(serverIndex, call, callback) {
    console.log('CancelReservation called by servers', serverIndex);
    const reservationId = call.request.reservation_id;
    //find the reservation to cancel 
    const index = dummy_reservation_data.findIndex(r => r.reservation_id === reservationId);
    if (index < 0) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Reservation not found for id: ' + reservationId });
    } else {
        //update state to cancelled
        dummy_reservation_data[index].status = 'CANCELLED';
        callback(null, { message: 'Reservation cancelled successfully' });
    }
}

//get reservation by reservation_id
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

//check in reservation
function checkInReservation(serverIndex, call, callback) {
    const reservationId = call.request.reservation_id;
    console.log('CheckInReservation ID: ', reservationId, ' called by servers', serverIndex);
    if (!reservationId) {
        callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Reservation ID is required' });
    }
    const reservation = dummy_reservation_data.find(r => r.reservation_id === reservationId);
    if (!reservation) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Reservation not found for id: ' + reservationId });
    } else {
        //to check in we must be in a confirmed state
        if (reservation.status !== 'CONFIRMED') {
            callback({ code: grpc.status.FAILED_PRECONDITION, message: `Reservation ${reservationId} is not confirmed.` });
        } else {
        //update status to checked in
        //update checked in date with current date
        reservation.status = 'CHECKED_IN';
        const currentDate = new Date();
        const isoDate = currentDate.toISOString();
        //i dont want the time for now i'd need to parse it on the UI and think im running out of time. 
        const datePart = isoDate.split('T')[0];
        reservation.check_in_date = datePart;
        callback(null, { reservation: reservation, message: `Reservation ${reservationId} is checked out.` });

        }
    }
}

//check out reservation
function checkOutReservation(serverIndex, call, callback) {
    const reservationId = call.request.reservation_id;
    console.log('CheckOutReservation ID: ', reservationId, ' called by servers', serverIndex);
    if (!reservationId) {
        callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Reservation ID is required' });
    }
    const reservation = dummy_reservation_data.find(r => r.reservation_id === reservationId);
    if (!reservation) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Reservation not found for id: ' + reservation_id });
    } else {
        //to check out we must be in a checked in state
        if (reservation.status !== 'CHECKED_IN') {
            callback({ code: grpc.status.FAILED_PRECONDITION, message: `Reservation ${reservationId} is not checked in.` });
        } else {
            //update status to checked out
            //update checked out date with current date
            reservation.status = 'CHECKED_OUT';
            const currentDate = new Date();
            const isoDate = currentDate.toISOString();
            //i dont want the time for now i'd need to parse it on the UI and think im running out of time. 
            const datePart = isoDate.split('T')[0];
            reservation.check_out_date = datePart;
            callback(null, { reservation: reservation, message: `Reservation ${reservationId} is checked out` });

        }
    }
}

//get all reservations
function getAllReservations(serverIndex, call, callback) {
    console.log('GetAllReservations called by servers', serverIndex);
    callback(null, { reservations: dummy_reservation_data });
}

//get reservations by user_id
function getReservationsByUserId(serverIndex, call, callback) {
    const userId = call.request.user_id;
    console.log('GetReservationByUserId called by servers', serverIndex);
    if (!userId) {
        callback({ code: grpc.status.INVALID_ARGUMENT, message: 'User ID is required' });
    }
    const reservations = dummy_reservation_data.filter(r => r.user_id === userId);
    callback(null, { reservations: reservations });
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
        CheckInReservation: (call, callback) => checkInReservation(i, call, callback),
        CheckOutReservation: (call, callback) => checkOutReservation(i, call, callback),
        GetAllReservations: (call, callback) => getAllReservations(i, call, callback),
        GetReservationsByUserId: (call, callback) => getReservationsByUserId(i, call, callback),
    });

    //port includes the index
    const finalPort = PORT + i
    // Bind the server to the port, 
    server.bindAsync(`0.0.0.0:${finalPort}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Server ${i} running at 0.0.0.0:${finalPort}`);
    });
}