# parse alcatel omni pcx VoIP tickets on the fly over Ethernet

this is a nodejs ES6 implementation to receive and parse VoIP tickets. it's a crazy protocol from back in the days where IT was really about bits and bytes. it is just a PoC, which works, but isn't complete and only decodes the simple fields.

## usage

make sure the `tickets` directory exists, then run the following command with the `PBX_IP` adapted to your environment

```PBX_IP=10.124.10.1 node receiver.js```

this script will receive the tickets and dump them to the tickets folder

```node reader.js```

will print the stats about all the tickets in the tickets folder

## example output

```
==== ticket_2017-10-12T13:42:42.889Z.data ====
End of communication      :  2017-10-12T15:42:42.000Z
Protocol Version          :  1
Equipment type            :  CplOmEnt
Local IP address          :  172.xx.xx.xx
Remote IP address         :  10.yyy.y.yy
Call Duration             :  14
Algo Compression Type     :  G711A
RTP Lost Packets NB       :  0
Delay                     :  00020000000000000000
Max Delay                 :  13
Jitter Depth              :  000002c3000002c30000000000000000000000000000000000000000000000000000000000000000
Min Delay                 :  11
```
