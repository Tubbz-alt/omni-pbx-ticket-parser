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
  'hex': x => x.toString('hex')
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
    '12': {
      'name': 'Call Duration',
    },
    '15': {
      'name': 'Algo Compression Type',
      'parser': parsers.algo
    },
    '24': {
      'name': 'RTP Lost Packets NB'
    },
    '27': {
      'name': 'Delay',
      'parser': parsers.hex
    },
    '28': {
      'name': 'Max Delay'
    },
    '32': {
      'name': 'Jitter Depth',
      'parser': parsers.hex
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
  var i = 4 // skip header

  while(i < l-3) {
    //console.log(i, "<", l, i < l)
    let field = buffer.readInt8(i)
    let length = buffer.readInt16BE(i+1)
    if (length > 0) {
      if (field in datastruct) {
        let payload = buffer.slice(i+3, i+3+length)
        if (datastruct[field].parser) {
          datastruct[field].value = datastruct[field].parser(payload)
        } else {
          datastruct[field].value = parsers.default(payload)
        }
      } else {
        //console.log("field", field, "not found")
      }
    }
    i+=length+3
  }

  console.log("====", ticketName, "====")
  for (let [key, obj] of Object.entries(datastruct)) {
     if(obj.value != undefined) console.log(obj.name.padEnd(25), ": ", obj.value)
  }
  console.log()

}

files = fs.readdirSync("./tickets")
files.forEach(file => {
  buffer = fs.readFileSync("./tickets/" + file)
  parseTicket(buffer, file)
})


//buffer = fs.readFileSync("ticket_11_53_53.data")
//parseTicket(buffer)
