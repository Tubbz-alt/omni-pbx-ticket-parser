fs = require('fs')

const CPU_IDENT     = Buffer.from([0x00, 0x01, 0x53])
const CPU_IDENT_OK  = Buffer.from([0x00, 0x01, 0x50])
const CPU_IDENT_OK2 = Buffer.from([0x50])
const INIT_REQ      = Buffer.from([0x00, 0x02, 0x00, 0x00])
const INIT_RSP      = Buffer.from([0x03, 0x04])
const TEST_REQ      = Buffer.from([0x54, 0x45, 0x53, 0x54, 0x5F, 0x52, 0x45, 0x51])
const TEST_RSP      = Buffer.from([0x00, 0x08, 0x54, 0x45, 0x53, 0x54, 0x5F, 0x52, 0x53, 0x50])
const TICKET_OK     = Buffer.from([0x00, 0x02, 0x00, 0x03])
const TICKET_START  = Buffer.from([0x01, 0x00, 0x07, 0x00])
const IGNORE        = Buffer.from([0x00, 0x08])

const PBX_port      = 2533
let   PBX_IP        = process.env.PBX_IP

if(PBX_IP == undefined) {
  console.log("no PBX specified, usage: PBX_IP=x.x.x.x node receiver.js")
  process.exit(1)
}

compare = (x1, x2) => Buffer.compare(x1, x2) == 0

datahandler = function(socket, data) {
  //console.log("length", data.length, "binary", data)
  if(compare(data, CPU_IDENT_OK) || compare(data, CPU_IDENT_OK2)) {
    console.log("intent recieved, send INIT_REQ")
    socket.write(INIT_REQ)
  } else if (compare(data, INIT_RSP)) {
    console.log("server confirmed with INIT_RSP")
  } else if (compare(data, TEST_REQ)) {
    console.log("got keep alive")
    socket.write(TEST_RSP)
  } else if (data.length > 772 ) { // || data.length == 774
    if(TICKET_START.compare(data, 0, TICKET_START.length) == 0) {
      filename = "./tickets/ticket_s" + data.length + "_" + (new Date()).toISOString() + '.data'
      console.log("got ticket, writing file", filename)
      fs.writeFile(filename, data, e => {
        if (e)
          console.log("problem writing file", filename, e)
      })
    } else {
      console.log("fake ticket?")
    }
    socket.write(TICKET_OK)
  } else if (compare(data, IGNORE)) {
    // prefix stuff, ignore
  } else {
    console.log("UNKNOW", "length", data.length, data)
  }
}


const net = require('net');
const client = net.createConnection({ host: PBX_IP, port: PBX_port }, () => {
  console.log('connected to server!');
  client.write(CPU_IDENT);
});

client.on('data', (data) => { datahandler(client, data) });

client.on('end', () => {
  console.log('disconnected from server');
});
