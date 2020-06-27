var restify = require('restify');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

var server = restify.createServer();

const http = require('http').Server(server);
const io = require('socket.io')(http);

const auctions = [{
    id: '0',
    name: 'benz',
    bids: [{
        userId: 'femi',
        amount: 2000
    }]
}]

io.on('connection', socket => {
    let previousId;
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId)
        previousId = currentId
        console.log('joining new Auction')
    }

    socket.on('getAuction', auctionId => {
        safeJoin(auctionId);
        console.log('loading', auctions[auctionId])
        socket.emit('auction', auctions[auctionId])
    })

    socket.on('addBid', bid => {
        const auctionId = bid.auctionId
        delete(bid.auctionId)
        auctions[auctionId].bids.push(bid)
        socket.to(auctionId).emit('auction', auctions[auctionId])
    })

    io.emit('auctions', auctions)
})

http.listen(4444);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
  });