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
====ticket_2017-10-17T10:37:45.177Z.data====
End of communication     : Tue Oct 17 2017 14:37:45 GMT+0200 (CEST)
Protocol Version         : 1
Equipment type           : CplOmEnt
Local IP address         : 172.x.x.x
Remote IP address        : 10.x.x.x
Local ID                 : xxxxxxxxxxx000000000000000000000
Distant ID               : yyyyy000000000000000000000000000
Call Duration            : 2
Local SSRC               : f0955582
Distant SSRC             : 4b5bf221
Algo Compression Type    : G711A
RTP Received Packets NB  : 133
Total RTP Packets Sent   : 140
RTP Lost Packets NB      : 0
Jitter Depth             : [130,131,0,0,0,0,0,0,0,0]
ICMP Packet Loss         : 0
Network Number           : 1
```
