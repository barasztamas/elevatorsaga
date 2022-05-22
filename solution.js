{
    init: (elevators, floors) => {
        elevators.forEach(e=>{
            e.showDirection = ()=>{
                //console.log(e.destinationQueue, e.currentFloor())
                if(e.destinationQueue.length==0){
                    e.goingUpIndicator(true);
                    e.goingDownIndicator(true);
                    return
                }
                if(e.destinationQueue[0]<e.currentFloor()){
                    e.goingUpIndicator(false);
                    e.goingDownIndicator(true);
                    return
                }
                if(e.destinationQueue[0]>e.currentFloor()){
                    e.goingUpIndicator(true);
                    e.goingDownIndicator(false);
                    return
                }
            };
            e.addToQueue = nr=>{
                e.goToFloor(nr);
                e.showDirection();
            };
            e.on("floor_button_pressed",nr=>{
                e.addToQueue(nr);
            });
            e.on("idle",()=>{
                e.addToQueue(0);
            });
            e.on("stopped_at_floor",nr=>{
                e.showDirection();
            });
        });
        
    },
        update: (dt, elevators, floors) => {
        }
}