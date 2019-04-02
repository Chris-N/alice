const fetch = require('node-fetch');
const Base64 = require('js-base64').Base64;

function Carrot(config){
    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    this.port = config.port;

    if(config.port)
      this.uri = `http://${config.username}:${config.password}@${config.host}:${config.port}/api`;
    else
      this.uri = `http://${config.username}:${config.password}@${config.host}/api`;
}

Carrot.prototype.overview = function() {
  return new Promise((res, rej) => {
    fetch(this.uri + '/overview', options)
    .then(result=>result.json())
    .then(data=> { 
      const { message_stats, cluster_name, queue_totals, object_totals } = data
      let result = { message_stats, cluster_name, queue_totals, object_totals }
      res(result); 
    })
    .catch(err => {console.error(err.stack); rej('Overview FAILED: ', err.stack)})  
  });
};

Carrot.prototype.queues = function() {
  return new Promise((res, rej) => {
    fetch(this.uri + '/queues')
    .then(result=>result.json())
    .then(data => {
      const result = data.map(el => {
      return el = {
        "message_stats": el.message_stats,
        "messages_persistent": el.messages_persistent,
        "backing_queue_status": el.backing_queue_status,
        "messages": el.messages,
        "messages_details": el.messages_details,
        "name": el.name,
        "node": el.node,
        "state": el.state
        }
      })
      res(result);
    })
    .catch(err => {console.error(err.stack); rej('Queues FAILED: ', err.stack)})  
  });
};

Carrot.prototype.exchanges = function() {
  return new Promise((res, rej) => {
    fetch(this.uri + '/exchanges')
    .then(result=>result.json())
    .then(data=> {
      const result = data.map(el => {
        const { message_stats, name, type, durable } = el

        let result = { message_stats, name, type, durable }
        if (!result.message_stats || !result.message_stats.publish_out) {
          result.message_stats = {
            "publish_in": 0,
            "publish_in_details": {
                "rate": 0
            },
            "publish_out": 0,
            "publish_out_details": {
                "rate": 0
            }
        }
          }
          return el = result;
        }
      )
      res(result);
    })
    .catch(err => {console.error(err.stack); rej('Exchanges FAILED: ', err.stack)})  
  });
};

Carrot.prototype.consumers = function() {
  return new Promise((res, rej) => {
    fetch(this.uri + '/consumers')
    .then(result=>result.json())
    .then(data => {
        const result = data.map(el => {
          const obj = {
            arguments: el.arguments,
            channel_details: el.channel_details,
            consumer_tag: el.consumer_tag,
            queue: el.queue
          };
        return obj;
      });
      res(result);
    })
    .catch(err => {console.error(err.stack); rej('Consumers FAILED: ', err.stack)})  
  });
};

Carrot.prototype.channels = function() {
  return new Promise((res, rej) => {
    fetch(this.uri + '/channels')
    .then(result =>result.json())
    .then(data => {
      let result = {
        producers: [],
        consumers: []
      }
      data.forEach(el => {
      if (el.consumer_count === 0) {
        let producer = {
          "message_stats": el.message_stats,
          "name": el.name,
          "state": el.state
        }
        result.producers.push(producer)
      } 
      if (el.consumer_count === 1) {
        let consumer = {
          "message_stats": el.message_stats,
          "name": el.name,
          "state": el.state
        }
        result.consumers.push(consumer)
      } 
      })
      res(result);
    })
    .catch(err => {console.error(err.stack); rej('Channels FAILED: ', err.stack)})  
  });
};

Carrot.prototype.bindings = function() {
  return new Promise((res, rej) => {
    fetch(this.uri + '/bindings')
    .then(res => res.json())
    .then(data => {
      let result = []
      data.forEach(el =>  {
        let binding = {
        "exchange_name": el.source,
        "queue_name": el.destination
      }
      result.push(binding)
    })
    res(result)
    })
    .catch(err => {console.error(err.stack); rej('Bindings FAILED: ', err.stack)})  
  });
};

Carrot.prototype.motherLoad = function () {
  return new Promise((res, rej) => {
    const urls = [this.uri + '/overview', this.uri + '/exchanges', this.uri + '/queues', this.uri + '/consumers', this.uri + '/channels', this.uri + '/bindings'];

    Promise.all(urls.map(url => 
    new Promise((resolve, reject) =>
        fetch(url)
        .then(result => result.json())
        // .then(data => console.log(data))
        .then(data => resolve(data))
      )
    ))
    .then(result => {
      // return result order: overview, exchanges, queues, consumers, channels, bindings 
      let data = massageData(result);
      res(data);
    })
    .catch(err => {console.error(err.stack); rej('MotherLoad FAILED: ', err.stack)})  
  });
}

// private helper function
function massageData(result){
      const data = {};
      data.cluster_name = result[0].cluster_name
      data.queue_totals = result[0].queue_totals
      data.object_totals = result[0].object_totals
      data.message_stats = result[0].message_stats
      data.exchanges = result[1].map(el => {
        const { message_stats, name, type, durable } = el

        let result = { message_stats, name, type, durable }
        if (!result.message_stats || !result.message_stats.publish_out) {
          result.message_stats = {
           "publish_in": 0,
           "publish_in_details": {
               "rate": 0
           },
           "publish_out": 0,
           "publish_out_details": {
               "rate": 0
           }
       }
          }
          return el = result;
      })
      data.queues = result[2].map(el => {
        const { message_stats, backing_queue_status, messages, messages_details, name, node, state } = el
        return el = { message_stats, backing_queue_status, messages, messages_details, name, node, state }       
      })
      data.consumers = []
      data.producers = [] 
      data.bindings = []
      
        result[4].forEach(el => {
        if (el.consumer_count === 0) {
          let producer = {
            "message_stats": el.message_stats,
            "name": el.name,
            "state": el.state
          }
          data.producers.push(producer)
        } 
        if (el.consumer_count === 1) {
          let consumer = {
            "message_stats": el.message_stats,
            "name": el.name,
            "state": el.state
          }
          data.consumers.push(consumer)
        } 
        })

        data.consumers.forEach(consumer => {
          result[3].forEach(el => {
            if (el.channel_details.name == consumer.name) {
              consumer.queue = el.queue.name
            }
          })
        })
      result[5].forEach(b=> {
        let binding = {
          "exchange_name": b.source,
          "queue_name": b.destination
        }
        data.bindings.push(binding)
      })
      // console.log('this is the final result ', result)
      return data;
}

export default Carrot;