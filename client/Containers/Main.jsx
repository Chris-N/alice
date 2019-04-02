import React, { Component } from 'react';
import { Base64 } from 'js-base64';
import Settings1 from '../Components/Settings1.jsx'
import Settings2 from '../Components/Settings2.jsx'
import Settings3 from '../Components/Settings3.jsx'
import Settings4 from '../Components/Settings4.jsx'
import Display from '../Components/Display.jsx'
import "@babel/polyfill";
import BlueBottle from '../../server/blueBottle.js';

const lib = new BlueBottle({
    host: '192.168.0.236',
    username: 'test',
    password: 'test',
    port: 15672
});

// d3Data reference

// "cluster_name": cluster_name,
// "nodes": [],
// "links": [],
// "producers": producers.length,
// "exchanges": exchanges.length,
// "queues": queues.length,
// "consumers": consumers.length


class Main extends Component{
    constructor(props) {
        super(props);
        this.state = {
          // ...d3Data,
          width: 800,
          height: 500,
          padding: 10,
          // titles: [
            // {
            //   name: 'Producers',
            //   x: (d3Data.width / 4) * 1 - (d3Data.width * 0.1),
            //   y: 10
            // },
            // {
            //   name: 'Exchanges',
            //   x: (d3Data.width / 4) * 2 - (d3Data.width * 0.1),
            //   y: 10
            // },
            // {
            //   name: 'Queues',
            //   x: (d3Data.width / 4) * 3 - (d3Data.width * 0.1),
            //   y: 10
            // },
            // {
            //   name: 'Consumers',
            //   x: (d3Data.width / 4) * 4 - (d3Data.width * 0.1),
            //   y: 10
            // }
          // ]
        }
        this.decrementTarget = this.decrementTarget.bind(this);
      }    
    componentDidMount() {
      console.log('DID MOUNT');
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + Base64.encode('test:test'));

      const options = {
        method: 'GET',
        mode: 'no-cors',
        headers: headers
      };

      // fetch('http://test:test@192.168.0.236:15672/api/overview')//, options)
      fetch('http://192.168.0.236:15672/api/overview', options)
      .then(result=>result.json())
      .then(data=> { 
        const { message_stats, cluster_name, queue_totals, object_totals } = data
        let result = { message_stats, cluster_name, queue_totals, object_totals }
        console.log('OVERVIEW: ' , result);
        console.log('SUCCESS!!!');
      })
      .catch(err => {console.error(err.stack);})  

      // const d3Data = await lib.getData()
      // this.setState({...d3Data});
    }
    decrementTarget(e) {
      
      console.log(this.state)
      let target = e.target.identifier;
      let mute = e.target.mute;
      if (e.target.mute === "false"){
        e.target.mute = "true";
        console.log('triggered with false')
        this.setState({[target]: this.state[target]-- })
      } else if (e.target.mute === "true"){
        e.target.mute = "false"
        console.log('triggered with true')
        this.setState({[target]: this.state[target]++})
      }
    }

  
  render() {
    return (
      <div className="the-grid">
        {/* <Display {...this.state}/> */}
        <Settings1 {...this.state} decrementTarget={this.decrementTarget}/>
        <Settings2 {...this.state} decrementTarget={this.decrementTarget}/>
        <Settings3 {...this.state} decrementTarget={this.decrementTarget}/>
        <Settings4 {...this.state} decrementTarget={this.decrementTarget}/>
      </div>
    )
  }
}

export default Main