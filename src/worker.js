let bc= new BroadcastChannel('wssChannel1')
const API = "1ee2f607bb918c3d5b039251e1cfc0bac70df8a3092d7f5e4f18bcc2618e2de2";
let buferWS=[] 
let buferBC=[]
const socket = new WebSocket(
   `wss://streamer.cryptocompare.com/v2?api_key=${API}`  );
  
socket.onmessage=(e)=>{
    buferWS.push(e.data)
    buferWS.forEach(el=>{
         bc.postMessage(el)
    })
   
   buferWS=[]
}

   
  
    
    self.onmessage=(eve)=>{
           // console.log('Arrived to worker',eve.data)
             buferBC.push(eve.data) 
             if (socket.readyState == WebSocket.OPEN) {
                socket.send(eve.data)
              }  
                     
                   socket.onopen=()=>{
                        //console.log('worker WSsending -',buferBC)
                        socket.send(buferBC.pop())
                        while (buferBC.length!=0){
                                if (socket.readyState == WebSocket.OPEN) {
                                        socket.send(buferBC.pop())
                                      }  

                        }
                          
                }
                          
        }
  
        
    
  
  
