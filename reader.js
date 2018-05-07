fs = require('fs')

let parsers = {
  'time': x => new Date(x.readIntBE(0, x.length)*1000),
  'default': x => x.readIntBE(0, x.length),
  'equipment': x => {
    let byte1 = x.readIntBE(0, 1)
    let byte2 = x.readIntBE(1, 1) // more details, currently not considered =>  [Type:1=IPPv2|2=NOEIPP|0=4980|1=WSftIP|0=IntIP|1=GD|2=eVA] :
    let equip = ["NA", "IPP", "APC", "CplOmEnt", "CplOmOFF"][byte1]
    return equip
  },
  'ip': x => x.join("."), //only v4
  'algo': x => ["G711A", "G711U", "G723", "G729"][x.readIntBE(0,1)],
  'hex': x => x.toString('hex'),
  'identifier': x => {
    let ret = ""
    for(let y=0;y<x.length;y++)
      ret+=x.readIntBE(y, 1)
    return ret
  },
  'groups': (x, count) => {
    let tokens = []
    let len = x.length / count
    //console.log("count", count, "len", len)
    for(let y=0;y<count;y++) {
      tokens.push(x.readIntBE(y*len, len))
      //tokens.push(x.slice(y*len, y*len+len).toString('hex'))
    }
    return "[" + tokens.join(",") + "]"
  }
}

function printTicket(nr, ticketName, datastruct) {
  let output = "====" + nr + "_" + ticketName + "====\n"
  for (let [key, obj] of Object.entries(datastruct)) {
      if(obj.value != undefined) output+=obj.name.padEnd(25) + ": " + obj.value + "\n"
  }
  output+="\n"
  console.log(output)
  return
  // filter stuff
  // equipment not IPP and callduration > 10sec?
  //if( datastruct[12].value > 10) { //datastruct[6].value!="IPP" &&
  // Filter for only CplOmEnt devices
  //if(datastruct[6].value == "CplOmEnt") {
  //  console.log(output)
  //}
}

function parseTicket(buffer, ticketName) {

  let datastruct = {
    '1': {
      'name': 'End of communication',
      'parser': parsers.time
    },
    '2': {
      'name': 'Protocol Version'
    },
    '6': {
      'name': 'Equipment type',
      'parser': parsers.equipment
    },
    '8': {
      'name': 'Local IP address',
      'parser': parsers.ip
    },
    '9': {
      'name': 'Remote IP address',
      'parser': parsers.ip
    },
    '10': {
      'name': 'Local ID',
      'parser': parsers.identifier
    },
    '11': {
      'name': 'Distant ID',
      'parser': parsers.identifier
    },
    '12': {
      'name': 'Call Duration',
    },
    '13': {
      'name': 'Local SSRC',
      'parser': parsers.hex
    },
    '14': {
      'name': 'Distant SSRC',
      'parser': parsers.hex
    },
    '15': {
      'name': 'Algo Compression Type',
      'parser': parsers.algo
    },
    '22': {
      'name': 'RTP Received Packets NB'
    },
    '23': {
      'name': 'Total RTP Packets Sent'
    },
    '24': {
      'name': 'RTP Lost Packets NB'
    },
    '27': {
      'name': 'Delay',
      'parser': x => parsers.groups(x,5)
    },
    '28': {
      'name': 'Max Delay'
    },
    '32': {
      'name': 'Jitter Depth',
      'parser': x => parsers.groups(x,10)
    },
    '33': {
      'name': 'ICMP Packet Loss'
    },
    '39': {
      'name': 'Terminal MCDU'
    },
    '40': {
      'name': 'Network Number'
    },
    '45': {
      'name': 'Min Delay'
    },
    '61': {
      'name': 'bfi distribution over 200ms',
      'parser': parsers.hex
    },
    '62': {
      'name': 'RTP consecutives lost',
      'parser': parsers.hex
    }
  }


  var l = buffer.length
  var i = 0 // skip header (4)
  var tCount = 0
  var fieldCounter = 0
  let field

  while(i < l-3) {
    //console.log(i, "<", l, i < l)
    try {
      field = buffer.readInt8(i)
    } catch (err) {
      console.log("catch", "range", i, l)
    }
    let length = buffer.readInt16BE(i+1)
    if(length < 0 || length > 10000) {
      console.log("fishy length", length, "at field", field)
      printTicket(tCount, ticketName, datastruct)
      return // 01 02 - 01 00 04 59
    }
    if (field == 1 && fieldCounter > 5) {
      printTicket(++tCount, ticketName, datastruct)
      fieldCounter = 0
    }
    fieldCounter++
    if (length > 0) {
      if (field in datastruct) {
        let payload = buffer.slice(i+3, i+3+length)
        if (datastruct[field].parser) {
          datastruct[field].value = datastruct[field].parser(payload)
        } else {
          datastruct[field].value = parsers.default(payload)
        }
        //console.log("field", field, "value", datastruct[field].value)
      } else {
        //console.log("field", field, "not found")
      }
    }
    i+=length+3
  }
  printTicket(tCount, ticketName, datastruct)
}

files = fs.readdirSync("./tickets")
files.forEach(file => {
  buffer = fs.readFileSync("./tickets/" + file)
  parseTicket(buffer, file)
})


//buffer = fs.readFileSync("ticket_11_53_53.data")
//parseTicket(buffer)
