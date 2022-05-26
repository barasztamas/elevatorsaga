{
    init: (elevators, floors) => {
        myAddToQueue = (nr, direction, queue)=>{
            if(!queue.includes(nr)) {
                queue.push(nr);
                queue.sort((a,b) => direction*(a-b));
            };
        };
        elevators.sort((e1, e2) => e2.maxPassengerCount()-e1.maxPassengerCount());
        commonQueue = [[],[],[]];
        addToCommonQueue = (nr, direction)=>{
            console.log('addcommon', nr, direction, commonQueue[direction+1]);
            myAddToQueue(nr, direction, commonQueue[direction+1]);
        };
        elevators.forEach((e,i)=>{
            e.index=i;
            e.additionalQueue = [];
            e.queueDirection = 0;
            e.direction = ()=> Math.sign((e.destinationQueue[0]??e.currentFloor()) - e.currentFloor());
            e.showDirection = ()=>{
                e.goingUpIndicator(e.direction()>=0);
                e.goingDownIndicator(e.direction()<=0);
            };
            e.tryAddDestination = (nr, direction)=>{
                if(e.destinationQueue.length==0) {
                    console.log('dest', e.index ,nr, direction, 'dest_newque', e.currentFloor(), e.destinationDirection(), e.queueDirection, e.destinationQueue);
                    if(nr!=e.currentFloor()) {
                        e.queueDirection=direction!=0 ? direction : Math.sign(nr-e.currentFloor());
                        myAddToQueue(nr, e.queueDirection, e.destinationQueue);
                        e.checkDestinationQueue();
                        e.showDirection();
                    }
                    return true;
                };
                if(direction==0 || direction==e.queueDirection) {
                    if(e.destinationQueue.includes(nr)){
                        return true;
                    };
                    if(
                        (nr-e.destinationQueue[0])*e.queueDirection>=0 //fits in queue direction
                        ||(nr-e.currentFloor())*e.direction()>0 //fits in current direction
                    ) {
                        console.log('dest', e.index ,nr, direction, 'dest', e.currentFloor(), e.destinationDirection(), e.queueDirection, e.destinationQueue);
                        myAddToQueue(nr, e.queueDirection, e.destinationQueue);
                        e.checkDestinationQueue();
                        e.showDirection();
                        return true;
                    }
                    if(direction==0) {
                        console.log('dest', e.index,nr, direction, 'sec', e.currentFloor(), e.destinationDirection(), e.queueDirection, e.destinationQueue);
                        myAddToQueue(nr, -e.queueDirection, e.additionalQueue);
                        return true;
                    }
                }
                console.log('dest', e.index, nr, direction, 'false', e.currentFloor(), e.destinationDirection(), e.queueDirection, e.destinationQueue);
                return false;
            };
            e.on("floor_button_pressed",nr=>{
                console.log('button', e.index, nr);
                e.tryAddDestination(nr, 0);
            });
            e.on("stopped_at_floor",nr=>{
                console.log('stop', e.index, nr, e.queueDirection, e.destinationQueue, e.additionalQueue);
                if(e.destinationQueue.length==0) {
                    newdirection = e.queueDirection==0 ? 1 : -e.queueDirection;
                    e.destinationQueue=e.additionalQueue.splice(0);
                    while(commonQueue[newdirection+1].length>0) {
                        myAddToQueue(commonQueue[newdirection+1].splice(0,1), newdirection, e.destinationQueue);
                    };
                    if(e.destinationQueue.length==0) {
                        newdirection = -newdirection;
                        e.destinationQueue=commonQueue[newdirection+1].splice(0);
                    };
                    if(e.destinationQueue.length==0) {
                        newdirection = 0;
                        if(e.currentFloor()!=0) {
                            myAddToQueue(0, 0, e.destinationQueue);
                            newdirection = -1;
                        }
                    };
                    e.queueDirection=newdirection;
                    e.checkDestinationQueue();
                };
                e.showDirection();
            });
        });
        floors.forEach(f=>{
            f.myButtonPressed = (direction)=>{
                console.log('floorbutton', f.floorNum(),direction);
                elevators.reduce((b,e)=>b||(e.tryAddDestination(f.floorNum(),direction)),false)||addToCommonQueue(f.floorNum(),direction);
            };
            f.on("up_button_pressed", ()=>f.myButtonPressed(1));
            f.on("down_button_pressed", ()=>f.myButtonPressed(-1));
        });

    },
        update: (dt, elevators, floors) => {

        }
}